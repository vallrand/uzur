import { terminate } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { DelayEvent, Tween, ease, resolveRigidConstraint } from '../../../lib/algorithms'

const findClosest = (location, entities) => {
    let index, minDistance = Infinity
    for(let i = entities.length - 1; i >= 0; i--){
        let distance = vec2.distance(location, entities[i].coordinates)
        if(distance > minDistance) continue
        minDistance = distance
        index = i
    }
    return { index, minDistance }
}

export const WebTechnique = (facade, {
    chainRadius = 300,
    duration = 0.1,
    maxLength = 20,
    indicator,
    hull
}) => {    
    const mask = facade.create({
        type: 'bitmap',
        texture: 'blue_mask.png',
        pivotX: 0.2, pivotY: 0.25,
        scaleX: 0.5, scaleY: 0.5,
        alpha: 0
    })
    
    const source = facade.create({
        type: 'bitmap',
        texture: 'radial_glow.png',
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 1, scaleY: 1,
        color: color.rgbHex([0.5, 0.75, 1]),
        blend: 'add',
        z: 2.5,
        alpha: 0
    })
    
    facade.procedure(deltaTime => {
        if(!indicator.enabled) (mask.alpha += deltaTime * 8 * (0 - mask.alpha))
        else (mask.alpha += deltaTime * 8 * (1 - mask.alpha))
        
        mask.color = color.rgbHex(hull.color)
        
        resolveRigidConstraint({
            instance: mask,
            target: hull,
            angleOffset: 0.1 * Math.PI
        })
        resolveRigidConstraint({
            instance: source,
            target: mask,
            offset: [55, 10]
        })
        
        if(indicator.enabled)
        if(facade.delegate.input.action && indicator.value == indicator.limit){
            indicator.value = 0
            connectChain()
        }
    })
    
    function connectChain(){
        facade.procedure(Tween({
            target: source,
            duration: 0.75,
            alpha: [0, 1.5],
            scaleX: [0.5, 1.5],
            scaleY: [0.5, 1.5],
            ease: ease.fade
        }))
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/charge.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })
        
        const candidates = facade.delegate.queryAll(entity => entity.alive && entity != facade.instance)

        const path = [ source ]
        while(candidates.length){
            const { index, minDistance } = findClosest(path[0].coordinates, candidates)
            if(minDistance > chainRadius || path.length >= maxLength) break
            path.unshift(candidates.splice(index, 1)[0])
        }
        if(path.length == 1) return

        const controlArray = path.map(entity => vec2.copy(entity.coordinates))

        const webSplines = Array.range(3).map(idx => facade.create({
            type: 'curve',
            controlPoints: controlArray,
            lineWidth: 24,
            baseOffset: 10 * idx,
            color: color.rgbHex([0.25, Math.randomFloat(0.5, 1.0), Math.randomFloat(0.75, 1)]),
            alpha: 0.75,
            z: 2,
            texture: 'assets/textures/energy_flow.png'
        }))

        path.slice(0, -1).reverse().forEach((entity, idx, entities) => {
            const glow = facade.create({
                type: 'bitmap',
                texture: 'radial_glow.png',
                pivotX: 0.5, pivotY: 0.5,
                scaleX: 0.5, scaleY: 0.5,
                rotation: Math.randomFloat(0, Math.TAU),
                color: color.rgbHex([0, 0.5, 1]),
                z: 2.5,
                blend: 'add',
                alpha: 0
            })

            facade.procedure(Tween({
                target: glow,
                delay: duration * idx,
                duration: 0.5,
                alpha: [0, 1.5],
                scaleX: [2, 0],
                scaleY: [2, 0],
                ease: ease.powerIn(2),
                update: () => {
                    glow.x = entity.coordinates[0]
                    glow.y = entity.coordinates[1]
                },
                end: () => {
                    glow.delete()
                    entity.handle('damage', { value: 250 })
                }
            }))
        })
        const totalDurarion = 2 * (path.length - 1) * duration
        const invDuration = 1 / totalDurarion
        
        const energyLoop = facade.create({
            type: 'sound',
            track: 'assets/sfx/energy_loop.mp3',
            layer: facade.delegate.channels.sfx,
            volume: 0.5,
            loop: true,
            rate: 1
        })
        energyLoop.play({ fadeIn: 0.1 })
        facade.procedure(DelayEvent(totalDurarion - 0.25, timeOffset => energyLoop.stop({ fadeOut: 0.25 })))
        
        let time = 0
        facade.procedure(deltaTime => {
            time += invDuration * deltaTime
            if(time > 1)
                return webSplines.forEach(spline => spline.delete()), terminate

            for(let i = path.length - 1; i >= 0; i--)
                vec2.copy(path[i].coordinates, controlArray[i])

            webSplines.forEach(spline => {
                spline.offset = time
                spline.controlPoints = controlArray
            })
        })
    }
}
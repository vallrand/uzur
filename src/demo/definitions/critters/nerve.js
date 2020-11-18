import { terminate } from '../../../lib/util'
import { vec2, color, shortestAngle } from '../../../lib/math'
import { RepeatEvent, DelayEvent, Tail, ease, resolveRigidConstraint } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    tailLength = 8,
    scaleRange = [1, 0.36],
    spawnRate = 4,
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(0),
    directionalVelocity = vec2(-250, 30)
}) => {
    const components = [{
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nerve_eye.png`,
        pivotX: 0.24, pivotY: 0.5,
        scaleX: 1 * size, scaleY: 1 * size,
        ambient
    }, {
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nerve_head.png`,
        pivotX: 0.36, pivotY: 0.5,
        scaleX: 1 * size, scaleY: 1 * size,
        x: spawnX, y: spawnY,
        ambient
    }, ...Array.range(tailLength)
    .map(idx => size * Math.lerp(scaleRange[0], scaleRange[1], idx / (tailLength - 1)))
    .map(scale => ({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nerve_tail.png`,
        pivotX: 0.85, pivotY: 0.5,
        x: spawnX, y: spawnY,
        scaleX: scale, scaleY: scale,
        scale, radius: scale * 60,
        ambient
    }))].map(description => facade.create(description))
    
    facade.stage.entities.reorder(...components.slice().reverse())
    
    const [ eye, head, ...tail ] = components
    
    const source = facade.create({
        type: 'bitmap',
        texture: 'radial_glow.png',
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 1, scaleY: 1,
        color: color.rgbHex([1.0, 0.75, 1]),
        blend: 'add',
        z: 2, alpha: 0
    })
    
    const constraints = [{
        instance: eye,
        target: head,
        offset: [-48 * size, 0]
    }, {
        instance: source,
        target: eye
    }]
    
    facade.procedure(Tail(components.slice(1), 1))
    
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    facade.procedure(RepeatEvent(spawnRate, (timeOffset, idx) => 
        facade.instance.handle('linkFlow', { source: eye, target: objective })
    ))
    
    facade.procedure((deltaTime, time) => {        
        vec2.fromAngle(head.rotation, directionalVelocity[0], velocity)
        head.x += deltaTime * velocity[0]
        head.y += deltaTime * velocity[1]
        
        const target = vec2.add([0, 0], [
            0.4 * facade.width * Math.sin(0.4 * time * Math.PI),
            0.4 * facade.height * Math.cos(0.6 * time * Math.PI)
        ])

        const angle = Math.atan2(target[1] - head.y, target[0] - head.x) - Math.PI
        const rotation = Math.clamp(shortestAngle(head.rotation, angle), -0.025 * Math.PI, 0.025 * Math.PI)
        head.rotation += deltaTime * rotation * directionalVelocity[1]

        constraints.forEach(resolveRigidConstraint)

        const pulseTime = time * 2 * Math.PI / spawnRate + Math.PI * 0.5
        const pulse = 0.5 - 0.5 * Math.sin(pulseTime - 1.5 * Math.PI + Math.cos(pulseTime - 1.5 * Math.PI))
        eye.scaleX = eye.scaleY = 1 - 0.24 * pulse
        source.alpha = 1 - Math.pow(1 - pulse, 2)
    })
    
    facade.registerEventHandler('linkFlow', ({ source, target }) => {
        const controlArray = [
            vec2.copy(target.coordinates),
            ...Array.range(3).map(idx => vec2(
                facade.width * Math.randomFloat(-0.4, 0.4),
                facade.height * Math.randomFloat(-0.4, 0.4)
            )),
            vec2.copy(source.coordinates)
        ]
        const curve = facade.create({
            type: 'curve',
            segments: 20,
            lineWidth: 36,
            baseOffset: 0,
            controlPoints: controlArray,
            texture: `${RECOLOR_PREFIX}assets/textures/blood_flow.png`
        })
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/skreak.mp3',
            loop: false,
            volume: 0.25,
            rate: Math.randomFloat(0.9, 1.1)
        })
        
        Array.range(5).forEach(idx => facade.procedure(DelayEvent(1.5 + idx * 0.15, timeOffset => {
            objective.handle('damage', { value: 0.5, type: 'impact' })
        })))

        facade.procedure(deltaTime => {
            curve.offset += 0.3 * deltaTime
            
            if(curve.offset > 1) return curve.delete(), terminate
            
            vec2.copy(target.coordinates, controlArray[0])
            vec2.copy(source.coordinates, controlArray[controlArray.length - 1])
            
            curve.controlPoints = controlArray
        })
    })
    
    facade.registerEventHandler('death', payload => new Promise(next => {
        if(!facade.instance.alive) return
        facade.instance.alive = false
        facade.transmitter.unsubscribe('linkFlow')
        
        facade.procedure(deltaTime => {
            let maxRadius = tail
            .map(component => component.radius = Math.max(0, component.radius - 64 * deltaTime))
            .reduce((max, radius) => Math.max(max, radius), 0)
            
            vec2.scale(directionalVelocity, Math.pow(0.975, 60 * deltaTime), directionalVelocity)
            constraints[0].offset[0] = Math.min(-30 * size, constraints[0].offset[0] + 32 * deltaTime)
            
            if(maxRadius <= 0 && !facade.instance.components.filter(component => component.program === 'curve').length)
                return (facade.instance.alive = true), next(), terminate
        })
    }))
    facade.registerEventHandler('death', Death(facade, { frameset: 'explosion', size: 0.75 * size }))
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: size * 1500,
        update: health => components.forEach(component => component.color = color.rgbHex([1, health, health]))
    }))
    
    return {
        velocity,
        coordinates: source.coordinates,
        boundingRadius: 50
    }
}
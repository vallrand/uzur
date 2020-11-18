import { terminate, UniqueKey } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { Tween, ease, RepeatEvent, checkBoundaries, axisAlignedRestriction, resolveRigidConstraint, Emitter, verlet } from '../../../lib/algorithms'

export default (facade, options) => {
    const trailParticles = Emitter(facade, {
        frequency: 0.1,
        spawnAmount: 0,
        maxCount: 256,
        update: verlet({
            alpha: ease.linearGradient([0, 0.75, 0.75, 1, 0.75, 0]),
            scaleX: (x, particle) => particle.scale * (1 - ease.powerIn(2)(x)),
            scaleY: (x, particle) => particle.scale * (1 - ease.powerIn(2)(x))
        }),
        emit: (stage, emitter) => stage.create({
            type: 'bitmap',
            layer: facade.delegate.layers['surface'].delegate,
            x: emitter.x,
            y: emitter.y,
            scale: emitter.size,
            pivotX: 0.5, pivotY: 0.5,
            timescale: 0.12,
            texture: 'particle.png',
            blend: 'add'
        })
    })
    const flag = UniqueKey()
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    facade.procedure((deltaTime, time) => {
        trailParticles.update(deltaTime)
        
        if(objective)
        for(let i = facade.instance.components.length - 1; i >= 0; i--){
            const particle = facade.instance.components[i],
                  radius = (objective.boundingRadius + 16 * particle.scaleX) * particle.alpha
            if(vec2.distance(particle.coordinates, objective.coordinates) < radius){
                objective.handle('damage', { value: 50 * deltaTime, type: 'continuous' })
                break   
            }
        }
        
        if(!facade.instance.components.length && !facade.delegate.queryAll(entity => entity[flag]).length)
            facade.instance.delete()
    })
    
    return {
        alive: false,
        coordinates: vec2(0, 0),
        footprints: (entity, { maxDistance = 36, maxTime = 0.5, offset = vec2.ZERO, size = 1 } = {}) => {
            entity[flag] = true
            const prevPosition = vec2(0, 0)
            let prevTime = 0
            return (deltaTime, time) => {
                let timeElapsed = time - prevTime
                let distance = vec2.distance(prevPosition, entity.coordinates)
                if(timeElapsed < maxTime && distance < maxDistance) return
                prevTime = time
                vec2.copy(entity.coordinates, prevPosition)
                trailParticles.emit(0, {
                    size,
                    x: prevPosition[0] + offset[0],
                    y: prevPosition[1] + offset[1]
                })
            }
        },
        inject: injector => injector(facade)
    }
}
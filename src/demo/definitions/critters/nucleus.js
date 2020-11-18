import { terminate } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { Tween, ease, checkBoundaries, axisAlignedRestriction, resolveRigidConstraint } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(-100, 0)
}) => {
    const front = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nucleus_left.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.75 * size, scaleY: 0.75 * size,
        ambient
    })
    const core = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nucleus_core.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.75 * size, scaleY: 0.75 * size,
        rotation: -0.5 * Math.PI,
        x: spawnX, y: spawnY,
        ambient
    })
    const glow = facade.create({
        type: 'bitmap',
        texture: 'particle.png',
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        alpha: 0
    })
    const back = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nucleus_right.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.75 * size, scaleY: 0.75 * size,
        ambient
    })
    
    const constraints = [{
        instance: back,
        target: core,
        offset: vec2(0, 0)
    }, {
        instance: front,
        target: core,
        offset: vec2(0, 0)
    }, {
        instance: glow,
        target: core
    }]
    
    facade.procedure((deltaTime, time) => {
        velocity[1] = 45 * Math.sin(5 * time)
        
        core.x += deltaTime * velocity[0]
        core.y += deltaTime * velocity[1]
        
        const offset = Math.max(0, Math.pow(Math.sin(2 * time), 3))
        glow.alpha = 0.75 * offset
        glow.scaleX = glow.scaleY = 0.25 + 0.5 * offset
        
        constraints[0].offset[0] = 35 * offset * size
        constraints[1].offset[0] = -15 * offset * size
        
        constraints.forEach(resolveRigidConstraint)
        
        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', payload =>
        facade.delegate.environment('surface').inject(scope => {
            const particle = scope.create({
                type: 'bitmap',
                texture: 'ripple_particle.png',
                layer: facade.delegate.layers['surface'].delegate,
                pivotX: 0.5, pivotY: 0.5,
                scaleX: 10, scaleY: 10,
                x: facade.instance.coordinates[0],
                y: facade.instance.coordinates[1]
            })
            
            facade.delegate.playSequentialSound({
                track: 'assets/sfx/tar.mp3',
                loop: false,
                volume: 0.5,
                position: facade.instance.coordinates,
                rate: Math.randomFloat(0.9, 1.1)
            })
            
            scope.procedure(Tween({
                target: particle,
                duration: 5,
                scaleX: [0, 4],
                scaleY: [0, 4],
                ease: ease.split(0.75, ease.powerOut(2), x => 1 - Math.pow(x, 2))
            }))
            
            scope.procedure(Tween({
                target: particle,
                duration: 5,
                alpha: [0, 2],
                ease: ease.fade,
                update: (f, time, deltaTime) => {
                    particle.x += deltaTime * velocity[0]
                    particle.y += deltaTime * velocity[1]
                    vec2.scale(velocity, Math.pow(0.5, deltaTime), velocity)
                },
                end: particle.delete.bind(particle)
            }))
        }), false)
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'explosion', size: 0.5 * size }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 500 * size,
        update: health => front.color = core.color = back.color = color.rgbHex([1, health, health])
    }))
    
    return {
        velocity,
        coordinates: core.coordinates,
        boundingRadius: 25 * size
    }
}
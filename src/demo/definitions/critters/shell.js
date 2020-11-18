import { vec2, color } from '../../../lib/math'
import { Tween, checkBoundaries, axisAlignedRestriction, resolveRigidConstraint } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(-100, 0)
}) => {
    const components = Array.range(4).map(idx => ({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}shell_${idx}.png`,
        pivotX: 0.2, pivotY: 0.3,
        scaleX: size * 0.25, scaleY: size * 0.25,
        x: spawnX, y: spawnY,
        ambient
    })).map(description => facade.create(description))
    
    facade.stage.entities.reorder(...components.slice().reverse())
    
    const glow = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}shell_eye_glow.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: size * 0.5, scaleY: size * 0.5,
        rotation: Math.randomFloat(0, Math.TAU),
        alpha: 0
    })
    
    const [ head, ...tail ] = components
    
    const constraints = [{
        instance: tail[0],
        target: head,
        vertical: [-15, 15],
        horizontal: [-8, 0],
        attract: [0, 0.005]
    }, {
        instance: tail[1],
        target: tail[0],
        vertical: [-15, 15],
        horizontal: [-8, 0],
        attract: [0, 0.005]
    }, {
        instance: tail[2],
        target: tail[1],
        vertical: [-15, 15],
        horizontal: [-8, 0],
        attract: [0, 0.005]
    }].map(constraint => axisAlignedRestriction({
        ...constraint,
        vertical: vec2.scale(constraint.vertical, size),
        horizontal: vec2.scale(constraint.horizontal, size)
    }))
    
    const sineToggle = disposition => value => Math.pow((Math.sin(0.5 * Math.PI + value) - disposition) / (1 + disposition), 2)
    
    facade.procedure((deltaTime, time) => {
        velocity[1] = 60 * Math.sin(4 * time)
        
        head.x += deltaTime * velocity[0]
        head.y += deltaTime * velocity[1]
        
        constraints.forEach(resolveConstraint => resolveConstraint(deltaTime))
        resolveRigidConstraint({
            instance: glow,
            target: head
        })
        glow.alpha = sineToggle(0.2)(1.64 * time)
        
        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'explosion', size: size * 0.7 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: size * 400,
        update: health =>
            components.forEach(component => component.color = color.rgbHex([1, health, health]))
    }))
    
    return {
        velocity,
        coordinates: head.coordinates,
        get boundingRadius(){ return 30 }
    }
}
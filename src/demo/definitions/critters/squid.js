import { terminate } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { Tween, ease, RepeatEvent, checkBoundaries, axisAlignedRestriction } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(0, 0)
}) => {
    const components = Array.range(4).map(idx => ({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}squid_${idx}.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.25 * size, scaleY: 0.25 * size,
        x: spawnX, y: spawnY,
        ambient
    })).map(description => facade.create(description))

    facade.stage.entities.reorder(...components.slice().reverse())
    
    const [ head, ...tail ] = components
    
    const constraints = [{
        instance: tail[0],
        target: head,
        vertical: [0, 0],
        horizontal: [0, 25],
        offset: [15, 0],
        attract: [0, 0]
    }, {
        instance: tail[1],
        target: tail[0],
        vertical: [0, 0],
        horizontal: [0, 20],
        offset: [-10, 0],
        attract: [0, 0]
    }, {
        instance: tail[2],
        target: tail[1],
        vertical: [0, 0],
        horizontal: [0, 15],
        offset: [-7, 0],
        attract: [0, 0]
    }].map(constraint => axisAlignedRestriction({
        ...constraint,
        vertical: vec2.scale(constraint.vertical, size),
        horizontal: vec2.scale(constraint.horizontal, size),
        offset: vec2.scale(constraint.offset, size)
    }))
    
    facade.procedure(facade.delegate.environment('surface').footprints(facade.instance, { offset: [-64 * size, 0], size: 0.58 * size }))
    
    facade.procedure(RepeatEvent(2, (timeOffset, idx) => {
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/stretch.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: Math.randomFloat(0.05, 0.1),
            rate: Math.randomFloat(0.9, 1.1)
        })
    }))
    
    facade.procedure((deltaTime, time) => {
        components.forEach((component, idx) =>
            component.x -= deltaTime * 180 * ease.sine(0.5 * (time + 0.5 - idx * 1 / 3)))
        
        constraints.forEach(resolveConstraint => resolveConstraint(deltaTime))

        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'blood', size: 0.75 * size }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 750 * size,
        update: health => components.forEach(component => component.color = color.rgbHex([1, health, health]))
    }))
    
    return {
        velocity,
        coordinates: head.coordinates,
        boundingRadius: 50 * size
    }
}
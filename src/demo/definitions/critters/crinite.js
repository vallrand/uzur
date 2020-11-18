import { vec2, color } from '../../../lib/math'
import { checkBoundaries, calculateBoundingSphere } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(-180, 0)
}) => {
    const cell = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}crinite_cell.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        rotation: Math.randomFloat(-0.15 * Math.PI, 0.15 * Math.PI),
        x: spawnX, y: spawnY,
        ambient
    })
    facade.procedure((deltaTime, time) => {
        velocity[1] = 18 * Math.sin(3 * time)
        
        cell.x += deltaTime * velocity[0]
        cell.y += deltaTime * velocity[1]
        
        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'explosion', size: size * 0.5 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 50 * Math.max(1, size),
        update: health => cell.color = color.rgbHex([1, health, health])
    }))
    
    return {
        velocity,
        coordinates: cell.coordinates,
        boundingRadius: calculateBoundingSphere(facade.instance)
    }
}
import { vec2, color } from '../../../lib/math'
import { Tween, resolveRigidConstraint, checkBoundaries, calculateBoundingSphere } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(Math.randomInt(-75, -100), 0)
}) => {
    const back = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}life_cell_back.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        ambient
    })
    const heart = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}life_cell_heart.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        rotation: Math.randomFloat(0, Math.TAU),
        x: spawnX, y: spawnY,
        ambient
    })
    const front = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}life_cell_front.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        ambient
    })
    
    const constraints = [{
        instance: back,
        target: heart
    }, {
        instance: front,
        target: back
    }]
    
    facade.procedure((deltaTime, time) => {
        const scale = 0.4 + 0.6 * Math.pow(Math.sin(4 * time), 4)
        heart.scaleX = heart.scaleY = 0.5 * scale * size
        
        velocity[1] = 18 * Math.sin(3 * time)
        
        heart.x += deltaTime * velocity[0]
        heart.y += deltaTime * velocity[1]
        
        constraints.forEach(resolveRigidConstraint)
        
        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'blood', size: size * 0.5 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 75 * size,
        update: health => {
            back.color = front.color = color.rgbHex([1, health, health])
            heart.color = color.rgbHex([health, health, health])
        }
    }))
    
    return {
        velocity,
        coordinates: heart.coordinates,
        boundingRadius: calculateBoundingSphere(facade.instance)
    }
}
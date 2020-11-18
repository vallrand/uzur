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
        texture: `${RECOLOR_PREFIX}mind_cell_back.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        ambient
    })
    const brain = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}mind_cell_brain.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        rotationOffset: Math.PI * Math.randomFloat(-1, 1),
        x: spawnX, y: spawnY,
        ambient
    })
    const front = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}mind_cell_front.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5 * size, scaleY: 0.5 * size,
        ambient
    })
    
    if(brain.rotationOffset > 0.25 * Math.PI || brain.rotationOffset < -0.75 * Math.PI)
        facade.stage.entities.reorder(front, brain, back)
    
    const constraints = [{
        instance: back,
        target: brain
    }, {
        instance: front,
        target: back
    }]
    
    facade.procedure((deltaTime, time) => {
        const scale = 0.2 + 0.8 * Math.pow(Math.sin(2 * time), 2)
        brain.scaleX = brain.scaleY = 0.5 * scale * size
        
        velocity[1] = 18 * Math.sin(3 * time)
        
        brain.x += deltaTime * velocity[0]
        brain.y += deltaTime * velocity[1]
        
        brain.rotation = window.b || brain.rotationOffset
        constraints.forEach(resolveRigidConstraint)
        
        brain.rotation -= Math.mod(4 * time, 2 * Math.PI)
        
        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'explosion', size: size * 0.5 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 75 * size,
        update: health => {
            back.color = front.color = color.rgbHex([1, health, health])
            brain.color = color.rgbHex([health, health, health])
        }
    }))
    
    return {
        velocity,
        coordinates: brain.coordinates,
        boundingRadius: calculateBoundingSphere(facade.instance)
    }
}
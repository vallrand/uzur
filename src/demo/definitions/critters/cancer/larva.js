import { terminate } from '../../../../lib/util'
import { vec2, vec3, color } from '../../../../lib/math'
import { Tween, checkBoundaries } from '../../../../lib/algorithms'
import { Death, Lifecycle } from '../../effects'
import { RECOLOR_PREFIX } from '../../adjustTone'

export default (facade, { target, distance = 200, ambient }) => {
    const larva = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}larva_${['sleeping', 'awake'][Math.randomInt(0, 1)]}.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5, scaleY: 0.5,
        x: target.x, y: target.y,
        z: -0.01,
        velocity: vec2(0, 0),
        ambient
    })
    
    facade.procedure((deltaTime, time) => {
        const position = target.coordinates
        const velocity = vec2.fromAngle(target.rotation + Math.PI, distance)
        
        const guidedPosition = vec2.scale(velocity, time / 0.5)
        vec2.add(guidedPosition, position, guidedPosition)
        
        const roamingPosition = vec2.scale(larva.velocity, deltaTime)
        vec2.add(roamingPosition, larva.coordinates, roamingPosition)
        
        const factor = Math.min(1, time / (0.5 + 0.25))
        
        larva.x = Math.lerp(guidedPosition[0], roamingPosition[0], factor)
        larva.y = Math.lerp(guidedPosition[1], roamingPosition[1], factor)
        
        if(vec2.magnitude(larva.velocity) > 75)
            vec2.scale(larva.velocity, 0.96, larva.velocity)

        larva.velocity[0] = Math.lerp(velocity[0], larva.velocity[0], factor)
        larva.velocity[1] = Math.lerp(velocity[1], larva.velocity[1], factor)

        if(!checkBoundaries(larva, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'blood', size: 0.5 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 250,
        update: health => larva.color = color.rgbHex(vec3(0.25 + 0.75 * health))
    }))
    
    return {
        velocity: larva.velocity,
        coordinates: larva.coordinates,
        get boundingRadius(){ return 50 * Math.min(larva.scaleX, larva.scaleY) }
    }
}
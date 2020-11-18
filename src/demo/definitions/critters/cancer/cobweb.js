import { vec2 } from '../../../../lib/math'
import { RepeatEvent, Emitter, Tween, ease } from '../../../../lib/algorithms'

export const Cobweb = (facade, {
    components,
    textures,
    linkDistance = 100,
    linkStretch = 50,
    stiffness = 0.1,
    ...properties
}) => {
    const pool = []
    let globalIndex = 0
    
    const hashIndex = (a, b) => 
        (a.index = a.index || ++globalIndex) + (b.index = b.index || ++globalIndex)
    
    const difference = vec2()
    
    return deltaTime => {
        let index = 0
        for(let l = 0, left = components[l]; left; left = components[++l])
        for(let r = l + 1, right = components[r]; right; right = components[++r]){
            vec2.subtract(right.coordinates, left.coordinates, difference)
            const distance = vec2.magnitude(difference)
            if(distance > linkDistance + linkStretch) continue
            
            if(!pool[index])
                pool[index] = facade.create({
                    type: 'bitmap',
                    pivotX: 0, pivotY: 0.5,
                    scaleX: 1, scaleY: 1,
                    ...properties
                })
                
            const link = pool[index++]            
            link.texture = textures[Math.mod(hashIndex(left, right), textures.length)]
            
            link.x = left.coordinates[0]
            link.y = left.coordinates[1]
            link.rotation = Math.atan2(difference[1], difference[0])
            link.scaleX = (distance / link.textureData.width)
            const linkLength = 0.75 * (1 - Math.clamp((distance - linkDistance) / linkStretch, 0, 1)) 
            link.scaleY = linkLength * Math.min(1, 0.04 * left.boundingRadius, 0.04 * right.boundingRadius)
            
            vec2.normalize(difference, difference)
            vec2.scale(difference, deltaTime * 60 * stiffness * 0.5 * (distance - linkDistance - 0.5 * linkStretch), difference)
            vec2.add(left.velocity, difference, left.velocity)
            vec2.subtract(right.velocity, difference, right.velocity)
        }
        for(let i = pool.length - 1; i >= index; i--)
            pool.splice(i, 1)[0].delete()
    }
}
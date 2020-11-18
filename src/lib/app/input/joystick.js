import { vec2 } from '../../math'
import { Gesture } from './gesture'

export const VirtualJoystick = ({
    element,
    visual,
    position,
    radius = Infinity
}) => {
    const origin = vec2.copy(position || vec2.ZERO),
          target = vec2.copy(origin)
    visual.origin = position
    visual.target = null
    
    let pressed = false
    function enter(x, y, aspectRatio){
        const coordinates = vec2(x, y)
        
        if(!position)
            vec2.copy(coordinates, origin)
        else if(vec2.distance(coordinates, origin) > 2 * radius)
            return false
        
        vec2.copy(coordinates, target)
        const direction = vec2.subtract(target, origin)
        vec2.truncate(direction, radius, direction)
        vec2.add(origin, direction, target)
        
        pressed = true
        visual.origin = origin
        visual.target = target
        determineDirection()
    }
    function move(x, y, aspectRatio){
        if(!pressed) return false
        
        const coordinates = vec2(x, y)
        
        vec2.copy(coordinates, target)
        const direction = vec2.subtract(target, origin)
        vec2.truncate(direction, radius, direction)
        vec2.add(origin, direction, target)
        
        visual.target = target
        determineDirection()
    }
    function release(){
        pressed = false
        visual.origin = position
        visual.target = null
        determineDirection()
    }
    Gesture(element, { enter, move, release })
    
    
    const direction = {
        delta: vec2()
    }
    
    function determineDirection(){
        if(!pressed) return Object.assign(direction, {
            delta: vec2(),
            up: false,
            down: false,
            right: false,
            left: false
        })
        const dx = target[0] - origin[0]
        const dy = target[1] - origin[1]

        const prevUp = direction.delta[1] < -0.5 * radius
        const prevDown = direction.delta[1] > 0.5 * radius
        const prevRight = direction.delta[0] > 0.5 * radius
        const prevLeft = direction.delta[0] < -0.5 * radius

        const up = dy < -0.5 * radius
        const down = dy > 0.5 * radius
        const right = dx > 0.5 * radius
        const left = dx < -0.5 * radius

        if(prevUp != up) direction.up = up
        if(prevDown != down) direction.down = down
        if(prevRight != right) direction.right = right
        if(prevLeft != left) direction.left = left

        direction.delta[0] = dx
        direction.delta[1] = dy
    }
    return direction
}
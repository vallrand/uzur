import { vec2 } from '../../math'

vec2.truncate = (vector, max = Infinity, out = vec2()) => {
    const length = vec2.magnitude(vector)
    return vec2.scale(vector, length && Math.min(length, max) / length, out)
}

export const Boid = ({
    x = 0,
    y = 0,
    maxVelocity = 1e2
} = {}) => {
    const position = vec2(x, y)
    const velocity = vec2(0, 0)
    
    const addForce = (steeringForce, deltaTime) => {
        vec2.truncate(steeringForce, 1e2, steeringForce)
        vec2.scale(steeringForce, 60 * deltaTime, steeringForce)

        vec2.add(velocity, steeringForce, velocity)
    }
    
    return {
        coordinates: position,
        velocity,
        seek: (target,  arrivalRadius, speed = 240) => deltaTime => {
            const direction = vec2.subtract(target, position)
            const distance = vec2.magnitude(direction)
            
            const targetVelocity = vec2.scale(direction, distance && speed / distance)
            if(distance < arrivalRadius)
                vec2.scale(targetVelocity, distance / arrivalRadius, targetVelocity)
                
            const steeringForce = vec2.subtract(targetVelocity, velocity)
            addForce(steeringForce, deltaTime)
        },
        integrate: deltaTime => {
            vec2.truncate(velocity, maxVelocity, velocity)
            vec2.add(position, vec2.scale(velocity, deltaTime), position)
            
            return position
        }
    }
}



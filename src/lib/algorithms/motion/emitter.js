import { combine, terminate } from '../../util'
import { vec2 } from '../../math'

export const Emitter = (stage, {
    frequency,
    spawnAmount,
    maxCount,
    emit,
    update,
    ...target
}) => {
    const particles = []
    let remainingTime = 0
    
    return combine(target, {
        particles,
        get spawnAmount(){ return spawnAmount },
        set spawnAmount(value){ spawnAmount = value },
        update: deltaTime => {
            for(let i = particles.length - 1; i >= 0; i--){
                let particle = particles[i]
                if(update(particle, deltaTime) === terminate || particle.lifetime < 0)
                    particles.splice(i, 1)[0].delete()
            }
            for(remainingTime += deltaTime; remainingTime > 0; remainingTime -= frequency)
                for(let i = spawnAmount; i >= 1; i--)
                    target.emit(remainingTime, target)
        },
        emit: (timeOffset, options) => {
            let particle = emit(stage, options)
            particle.lifetime = 1
            update(particle, timeOffset) === terminate || particle.lifetime < 0 
                ? particle.delete()
                : particles.push(particle)
            if(particles.length >= maxCount) particles.shift().delete()
        },
        delete: () => {
            particles.forEach(particle => particle.delete())
            particles.length = 0
        }
    })
}

export const verlet = properties => (particle, deltaTime) => {
    deltaTime *= particle.timescale || 1
    particle.lifetime -= deltaTime
    if(particle.lifetime < 0) return terminate
    
    if(particle.velocity){
        vec2.scale(particle.velocity, Math.pow(particle.friction || 1, 60 * deltaTime), particle.velocity)
        if(particle.acceleration){
            particle.velocity[0] += particle.acceleration[0] * deltaTime
            particle.velocity[1] += particle.acceleration[1] * deltaTime
        }
        particle.x += particle.velocity[0] * deltaTime
        particle.y += particle.velocity[1] * deltaTime
    }
    
    if(particle.angularVelocity)
        particle.rotation += particle.angularVelocity * deltaTime
        
    for(let property in properties)
        particle[property] = properties[property](1 - particle.lifetime, particle)
}
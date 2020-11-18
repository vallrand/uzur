import { terminate } from '../../../lib/util'
import { vec2, color, shortestAngle } from '../../../lib/math'
import { RepeatEvent, Tail, checkBoundaries } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    tailLength = 24,
    scaleRange = [0.5, 0.1],
    spawnRate = 1.5,
    spawnRange = [6, 12],
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(0),
    directionalVelocity = vec2(-150, 1)
}) => {
    const components = [{
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nest_head.png`,
        pivotX: 0.75, pivotY: 0.5,
        scale: size * 0.5,
        x: spawnX, y: spawnY,
        ambient
    }, ...Array.range(tailLength)
    .map(idx => size * Math.lerp(scaleRange[0], scaleRange[1], idx / (tailLength - 1)))
    .map(scale => ({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}nest_tail.png`,
        pivotX: 0.5, pivotY: 0.5,
        x: spawnX, y: spawnY,
        scale, radius: scale * 46,
        ambient
    }))].map(description => facade.create(description))
    
    facade.stage.entities.reorder(...components.slice().reverse())
    
    const [ head, ...tail ] = components
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    const pulsate = time => 0.75 * Math.pow(Math.cos(0.5 * Math.PI * Math.sin(time)), 32) + 0.25 * Math.pow(Math.cos(2 * time), 2)
    
    facade.procedure((deltaTime, time) => {
        vec2.fromAngle(head.rotation, directionalVelocity[0], velocity)
        head.x += deltaTime * velocity[0]
        head.y += deltaTime * velocity[1]
        
        const target = vec2.add(objective.coordinates, [
            50 * Math.sin(time * Math.PI),
            50 * Math.cos(time * Math.PI)
        ])

        const angle = Math.atan2(target[1] - head.y, target[0] - head.x) - Math.PI
        const rotation = Math.clamp(shortestAngle(head.rotation, angle), -0.15 * Math.PI, 0.15 * Math.PI)
        head.rotation += deltaTime * directionalVelocity[1] * (rotation * 3.84 + 3 * Math.sin(5 * time))
    })
    facade.procedure((deltaTime, time) => {
        let pulseTime = time * Math.PI / spawnRate - Math.PI * 0.1
        for(let i = 0, component = components[i]; component; component = components[++i]){
            const pulse = pulsate(pulseTime)
            component.scaleY = component.scale * (1 - 0.36 * pulse)
            component.scaleX = component.scale * (1 - 0.5 * 0.36 * pulse)
            pulseTime -= Math.PI * 0.75 / tailLength
        }
    })
    facade.procedure(Tail(components))
    facade.procedure(RepeatEvent(spawnRate, (timeOffset, idx) => {
        const position = vec2.fromAngle(head.rotation, -40)
        vec2.add(position, head.coordinates, position)
        const spawnAmount = Math.randomInt(spawnRange[0], spawnRange[1])
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/hatchery.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })
        
        for(let i = spawnAmount; i > 0; i--)
            facade.instance.handle('swarm', {
                x: position[0] + Math.randomInt(-24, 24),
                y: position[1] + Math.randomInt(-24, 24)
            })
    }))
	
    const curve = value => 4 * (Math.pow(value, 2) - Math.pow(value, 4))
    
    facade.registerEventHandler('swarm', properties => {
        const swarm = facade.create({
            type: 'bitmap',
            texture: `${RECOLOR_PREFIX}swarm.png`,
            layer: facade.delegate.layers['dissolve'].delegate,
            pivotX: 0.5, pivotY: 0.5,
            scaleX: 0.0, scaleY: 0.0,
            lifespan: 1,
            color: 0xffffff,
            velocity: vec2.fromAngle(Math.randomFloat(0, Math.TAU), Math.randomFloat(500, 700)),
            ambient,
            ...properties
        })
        
        facade.procedure((deltaTime, time) => {
            swarm.x += swarm.lifespan * swarm.velocity[0] * deltaTime
            swarm.y += swarm.lifespan * swarm.velocity[1] * deltaTime
            
            swarm.velocity[0] += Math.randomFloat(-12000, 12000) * deltaTime
            swarm.velocity[1] += Math.randomFloat(-12000, 12000) * deltaTime
			
            swarm.lifespan *= Math.pow(0.96, deltaTime * 60)
            
            swarm.scaleX = swarm.scaleY = Math.min(0.8, curve(-swarm.lifespan))
            
            if(swarm.scaleX > 0.05 && vec2.distance(swarm.coordinates, objective.coordinates) < objective.boundingRadius + swarm.scaleX * 10)
                return objective.handle('damage', { value: 10, type: 'impact' }), swarm.delete(), terminate
            
            if(swarm.lifespan < 1e-6 || !checkBoundaries(swarm, facade))
                return swarm.delete(), terminate
        })
    })
    
    facade.registerEventHandler('death', payload => new Promise(next => {
        facade.instance.alive = false
        facade.transmitter.unsubscribe('swarm')
        
        facade.instance.components
            .filter(component => components.indexOf(component) == -1)
            .forEach(component => component.lifespan = 0)
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/flatter.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })
        
        facade.procedure(deltaTime => {
            tail.forEach((component, idx) => component.radius = Math.max(0, component.radius - 28 * deltaTime))
            head.scale = Math.max(0, head.scale - 0.16 * deltaTime)
            head.pivotX += deltaTime * 10 * (0.5 - head.pivotX)
            
            vec2.scale(directionalVelocity, Math.pow(0.975, 60 * deltaTime), directionalVelocity)
            
            if(tail[0].radius <= 6)
                return next(), terminate
        })
    }), false)
    facade.registerEventHandler('death', Death(facade, { frameset: 'blood', size: 0.75 * size }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 1000 * size,
        update: health => components.forEach(component => component.color = color.rgbHex([1, health, health]))
    }))
    
    
    return {
        velocity,
        coordinates: head.coordinates,
        boundingRadius: 50
    }
}
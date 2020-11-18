import { terminate } from '../../../lib/util'
import { vec2, vec4, color } from '../../../lib/math'
import { Tween, ease, resolveRigidConstraint } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

const Tentacle = ({
    x = 0, y = 0,
    segments = 10,
    spacing = 20,
    friction = 0.8,
    acceleration = vec2(0, 0.5)
}) => {
    const positions = Array.range(segments).map(idx => vec4(x, y, idx / (segments - 1), 1)),
          prevPositions = Array.range(segments).map(idx => vec2(x, y)),
          velocities = Array.range(segments).map(idx => vec2(0, 0))
    
    return {
        get points(){ return positions },
        set head(position){ vec2.copy(position, positions[0]) },
        update: deltaTime => {
            deltaTime *= 60
            
            for(let prev = positions[0], i = 1; i < positions.length; i++){
                let position = positions[i],
                    prevPosition = prevPositions[i],
                    velocity = velocities[i]
                
                position[0] += deltaTime * velocity[0]
                position[1] += deltaTime * velocity[1]
                
                let dx = prev[0] - position[0]
                let dy = prev[1] - position[1]
                let angle = Math.atan2(dy, dx)
                
                let x = position[0] + Math.cos(angle) * spacing
                let y = position[1] + Math.sin(angle) * spacing
                
                position[0] += prev[0] - x
                position[1] += prev[1] - y
                
                vec2.subtract(position, prevPosition, velocity)
                vec2.scale(velocity, Math.pow(friction, deltaTime), velocity)
                
                velocity[0] += deltaTime * acceleration[0]
                velocity[1] += deltaTime * acceleration[1]
                
                vec2.copy(position, prevPosition)
                
                prev = position
            }
        }
    }
}

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient,
    velocity = vec2(0, 0)
}) => {
    const top = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}hive_top.png`,
        pivotX: 0.2, pivotY: 0.85,
        scaleX: 1.0, scaleY: 1.0,
        ambient
    })
    const torso = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}hive_torso.png`,
        pivotX: 0.2, pivotY: 0.85,
        scaleX: 1.0, scaleY: 1.0,
        ambient
    })
    const mouth = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}hive_mouth.png`,
        pivotX: 0.2, pivotY: 0.85,
        scaleX: 1.0, scaleY: 1.0,
        x: spawnX, y: Math.clamp(spawnY, -0.3 * facade.height, 0.3 * facade.height),
        ambient
    })
    
    const constraints = [{
        instance: torso,
        target: mouth,
        offset: [0, 0]
    }, {
        instance: top,
        target: torso,
        offset: [0, 0]
    }]
    
    const tentacles = Array.range(Math.randomInt(3, 5)).map(idx => facade.create({
        type: 'curve',
        controlPoints: [],
        lineWidth: 36,
        baseOffset: 0,
        offset: 0.5,
        texture: `${RECOLOR_PREFIX}assets/textures/tentacle.png`
    }))
    
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    tentacles.forEach(curve => {
        const tentacle = Tentacle({
            segments: Math.randomInt(15, 30),
            spacing: Math.randomFloat(12, 20),
            friction: Math.randomFloat(0.8, 0.9),
            acceleration: [Math.randomFloat(-0.5, 0.5), 0.94],
            x: spawnX, y: spawnY
        })
        const farRadius = 300,
              attractForce = 10,
              difference = vec2()
        let cooldown = 0
        
        facade.procedure((deltaTime, time) => {
            curve.baseOffset = time
            
            tentacle.head = mouth.coordinates
            tentacle.update(deltaTime)
            
            const { points } = tentacle
            if((cooldown -= deltaTime) < 0)
            for(let i = points.length - 1; i >= 0; i--){
                vec2.subtract(objective.coordinates, points[i], difference)
                const distance = vec2.magnitude(difference)
                if(distance < 0.75 * objective.boundingRadius){
                    cooldown = 1
                    objective.handle('damage', { value: 10, type: 'impact' })
                    break
                }
                
                const force = distance / farRadius
                if(!force || force > 1) continue
                vec2.normalize(difference, difference)
                vec2.scale(difference, deltaTime * 60 * points[i][2] * attractForce * ease.fade(force), difference)
                vec2.add(points[i], difference, points[i])
            }
            
            curve.splineCurve = points
        })
    })
    
    const motion = x => Math.pow(Math.sin(0.5 * Math.PI * x), 8.0)
    
    facade.procedure((deltaTime, time) => {
        const dx = objective.coordinates[0] - mouth.x - facade.instance.boundingRadius

        mouth.x -= Math.min(0, 150 * deltaTime * Math.sin((time - 0.0) * Math.PI)) * Math.clamp(dx, -1, 1)
        mouth.y += 300 * deltaTime * Math.sin((time - 0.25) * Math.PI)
        mouth.rotation = Math.lerp(-0.036 * Math.PI, 0.036 * Math.PI, ease.sine(0.25 + 0.5 * time))

        constraints[0].offset[0] = 20 * motion(time)
        constraints[0].offset[1] = -20 * motion(time)
        constraints[1].offset[0] = 20 * motion(time - 0.25)
        constraints[1].offset[1] = -20 * motion(time - 0.25)
        
        constraints.forEach(resolveRigidConstraint)
    })
    
    facade.registerEventHandler('death', payload => new Promise(next => {        
        facade.instance.alive = false
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/flatter.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })

        facade.instance.procedures.length = 0
		vec2.copy(vec2.ZERO, velocity)
        facade.procedure((deltaTime, time) => {
            const minOffset = tentacles
            .map(curve => curve.offset = Math.min(1, curve.offset + deltaTime))
            .reduce((min, offset) => Math.min(min, offset))
            
            constraints[0].offset[0] += deltaTime * 10 * -constraints[0].offset[0]
            constraints[0].offset[1] += deltaTime * 10 * -constraints[0].offset[1]
            constraints[1].offset[0] += deltaTime * 10 * -constraints[1].offset[0]
            constraints[1].offset[1] += deltaTime * 10 * -constraints[1].offset[1]
            mouth.rotation = Math.lerp(-0.1 * Math.PI, 0.1 * Math.PI, ease.sine(8 * time))
        
            constraints.forEach(resolveRigidConstraint)
            
            if(minOffset >= 1)
                return next(), terminate
        })
    }), false)
    facade.registerEventHandler('death', Death(facade, { frameset: 'blood', size: 1.25 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 1500,
        update: health => top.color = torso.color = mouth.color = color.rgbHex([1, health, health])
    }))
    
    return {
        velocity,
        get coordinates(){ return vec2.add(torso.coordinates, [30, -30]) },
        boundingRadius: 50
    }
}
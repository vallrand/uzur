import { terminate } from '../../../lib/util'
import { vec2, color, shortestAngle } from '../../../lib/math'
import { resolveRigidConstraint, Emitter, verlet, ease, checkBoundaries } from '../../../lib/algorithms'

export const SwarmTechnique = (facade, {
    cooldown = 0.1,
    indicator,
    hull
}) => {
    const mask = facade.create({
        type: 'bitmap',
        texture: 'red_mask.png',
        pivotX: 0.1, pivotY: 0.1,
        scaleX: 0.5, scaleY: 0.5,
        alpha: 0
    })
    
    const smokeParticles = Emitter(facade, {
        frequency: 0.1,
        spawnAmount: 0,
        maxCount: 64,
        emit: (stage, emitter) => stage.create({
            type: 'bitmap',
            pivotX: 0.5, pivotY: 0.5,
            x: emitter.x, y: emitter.y,
            friction: 0.96,
            velocity: vec2.fromAngle(Math.randomFloat(0, Math.TAU), 256 * Math.randomFloat(0.5, 1.0)),
            acceleration: [ Math.randomFloat(-200, 0), Math.randomFloat(-200, 0) ],
            rotation: Math.randomFloat(0, Math.TAU),
            texture: 'cloud.png',
            z: 0.5,
            timescale: 1.25
        }),
        update: verlet({
            color: x => color.rgbHex([1-x, 1-x, 1-x]),
            alpha: (curve => x => 0.64 * curve(1 - x))(ease.slide(3)),
            scaleX: x => 1.5 * ease.curve(0.5)(x),
            scaleY: x => 1.5 * ease.curve(0.5)(x)
        })
    })
    
    let timeout = cooldown
    facade.procedure(deltaTime => {
        if(!indicator.enabled) (mask.alpha += deltaTime * 8 * (0 - mask.alpha))
        else (mask.alpha += deltaTime * 8 * (1 - mask.alpha))
        
        mask.color = color.rgbHex(hull.color)
        
        resolveRigidConstraint({
            instance: mask,
            target: hull,
            angleOffset: 0.1 * Math.PI
        })
        
        timeout -= deltaTime
        
        if(indicator.enabled)
        if(timeout < 0 && facade.delegate.input.action && (indicator.value >= 1 && !indicator.rate || indicator.value == indicator.limit)){
            launchSeeker()
            indicator.value = Math.floor(indicator.value - 1)
            indicator.rate = indicator.value == 0 ? 1 : 0
            timeout = cooldown
        }
    })
    
    const seekers = []
    function launchSeeker(){
        const seeker = facade.create({
            type: 'bitmap',
            texture: 'seeker.png',
            layer: facade.delegate.layers['dissolve'].delegate,
            pivotX: 0.5, pivotY: 0.5,
            scaleX: 0.5, scaleY: 0.5,
            lifespan: 1,
            x: mask.x,
            y: mask.y
        })
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/spawn.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: Math.randomFloat(0.2, 0.36),
            rate: Math.randomFloat(0.9, 1.1)
        })
        
        resolveRigidConstraint({
            instance: seeker,
            target: mask,
            offset: [40, 15]
        })
        
        seeker.cleanupProcedures.push(seekers.remove.bind(seekers, seeker))
        seekers.unshift(seeker)
    }
    
    facade.procedure(deltaTime => {
        const candidates = facade.delegate.queryAll(entity => entity.alive && entity != facade.instance)
        const weights = Array(candidates.length).fill(0)
        
        outer: for(let i = seekers.length - 1; i >= 0; i--){
            const seeker = seekers[i]
            
            seeker.velocity = vec2.fromAngle(seeker.rotation, 400 * Math.min(1, 8 * (1 - seeker.lifespan)))
            
            seeker.x += seeker.velocity[0] * deltaTime
            seeker.y += seeker.velocity[1] * deltaTime
            
            let potentialIdx, rotation, minWeight = Infinity
            
            for(let i = candidates.length - 1; i >= 0; i--){
                let candidate = candidates[i]
                let dx = candidate.coordinates[0] - seeker.coordinates[0]
                let dy = candidate.coordinates[1] - seeker.coordinates[1]
                let da = Math.atan2(dy, dx)
                let distanceSquared = dx*dx + dy*dy
                
                let radius = 20
                if(radius * radius > distanceSquared){
                    candidate.handle('damage', { value: 150 })
                    facade.delegate.playSequentialSound({
                        track: 'assets/sfx/hit.mp3',
                        loop: false,
                        position: seeker.coordinates,
                        volume: 0.16,
                        rate: 1
                    })
                    seeker.delete()                    
                    candidates.splice(i, 1)
                    weights.splice(i, 1)
                    
                    for(let count = 8; count > 0; count--)
                        smokeParticles.emit(0, { x: candidate.coordinates[0], y: candidate.coordinates[1] })
                    
                    continue outer
                }
                let angle = shortestAngle(seeker.rotation, da + Math.PI)
				let weight = distanceSquared * Math.abs(angle / Math.PI) + weights[i]
                if(weight > minWeight) continue
                minWeight = weight
                rotation = angle
                potentialIdx = i
            }
            if(potentialIdx == null)
                seeker.rotation += deltaTime * 10 * Math.randomFloat(-Math.PI, Math.PI)
            else{
                weights[potentialIdx] += 86 * 1e3
                seeker.rotation -= deltaTime * 2 * rotation
            }

            seeker.lifespan -= 0.1 * deltaTime
            
            seeker.scaleX = seeker.scaleY = 0.5 * Math.clamp(8.0 * (1 - seeker.lifespan), 0.05, 0.5)
            seeker.alpha = Math.min(16.0 * (1 - seeker.lifespan), 1)
            
            if(seeker.lifespan <= 0 || !checkBoundaries(seeker, facade))
                seeker.delete()
        }
        
        smokeParticles.update(deltaTime)
    })
}
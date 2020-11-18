import { terminate } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { resolveRigidConstraint, Emitter, verlet, ease } from '../../../lib/algorithms'

export const LiquidTechnique = (facade, {
    spreadAngle = 0.1 * Math.PI,
    spreadDistance = 500,
    costRate = 500,
    damageMultiplier = 5,
    weightThreshold = 0.75 * 150,
    indicator,
    hull
}) => {
    const mask = facade.create({
        type: 'bitmap',
        texture: 'green_mask.png',
        pivotX: 0.15, pivotY: 0.05,
        scaleX: 0.5, scaleY: 0.5,
        alpha: 0
    })
    
    facade.procedure(deltaTime => {
        if(!indicator.enabled) (mask.alpha += deltaTime * 8 * (0 - mask.alpha))
        else (mask.alpha += deltaTime * 8 * (1 - mask.alpha))
        
        mask.color = color.rgbHex(hull.color)
        
        resolveRigidConstraint({
            instance: mask,
            target: hull,
            angleOffset: 0.1 * Math.PI
        })
        
        resolveRigidConstraint({
            instance: liquidParticles,
            target: mask,
            offset: [45, 20],
            angleOffset: 0.96 * (liquidParticles.rotation - mask.rotation)
        })
        
        if(indicator.enabled)
        liquidParticles.spawnAmount = (facade.delegate.input.action && (indicator.value -= deltaTime * costRate) > 0) ? 1 : 0
    })
    
    const liquidParticles = Emitter(facade, {
        x: 0, y: 0, rotation: 0,
        frequency: 0.02,
        spawnAmount: 1,
        maxCount: 512,
        update: verlet({
            alpha: ease.linearGradient([0.5, 0.5, 0.75, 0.5, 0]),
            scaleX: ease.linearGradient([1, 2, 4, 4, 5]),
            scaleY: ease.linearGradient([1, 2, 4, 4, 5]),
            color: x => color.rgbHex([
                Math.max(0, 1-2*x),
                Math.pow(1-x, 2),
                Math.pow(1-x, 4)
            ])
        }),
        emit: (stage, emitter) => stage.create({
            type: 'bitmap',
            layer: facade.delegate.layers['liquid'].delegate,
            x: emitter.x,
            y: emitter.y,
            pivotX: 0.5, pivotY: 0.5,
            timescale: 0.36,
            friction: 0.98,
            velocity: vec2.fromAngle(
                emitter.rotation + Math.randomFloat(-spreadAngle, spreadAngle),
                spreadDistance * Math.randomFloat(0.75, 1.25)
            ),
            acceleration: [ Math.randomFloat(0, 400), Math.randomFloat(-500, 100) ],
            angularVelocity: Math.randomFloat(-0.25 * Math.PI, 0.25 * Math.PI),
            rotation: Math.randomFloat(0, Math.TAU),
            texture: 'mush.png',
            blend: 'add'
        })
    })
    
    const liquidLoop = facade.create({
        type: 'sound',
        track: 'assets/sfx/liquid_loop.mp3',
        layer: facade.delegate.channels.sfx,
        volume: 0,
        loop: true,
        rate: 1
    })
    liquidLoop.play()
    
    facade.procedure(deltaTime => {
        if(!indicator.enabled) liquidParticles.spawnAmount = 0
        liquidParticles.update(deltaTime)
        
        liquidLoop.volume = Math.clamp(liquidLoop.volume + deltaTime * (liquidParticles.spawnAmount ? 0.5 : -0.5), 0, 0.5)
        liquidLoop.position = facade.instance.coordinates
        
        const candidates = facade.delegate.queryAll(entity => entity.alive && entity != facade.instance)
        const { particles } = liquidParticles

        candidates.forEach(candidate => {
            let weight = 0
            for(let i = particles.length - 1; i >= 0; i--){
                let particle = particles[i],
                    dx = particle.coordinates[0] - candidate.coordinates[0],
                    dy = particle.coordinates[1] - candidate.coordinates[1],
                    radius = candidate.boundingRadius + 0.5 * 20 * Math.max(particle.scaleX, particle.scaleY)
                weight += Math.pow(particle.alpha, 2) * Math.max(0, radius * radius - (dx*dx + dy*dy))
            }
            if(weight > weightThreshold)
                candidate.handle('damage', { value: deltaTime * damageMultiplier * (weight / weightThreshold - 1) })
        })
    })
}
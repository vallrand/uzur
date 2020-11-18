import { vec2, color } from '../../../lib/math'
import { Tween, ease, checkBoundaries, axisAlignedRestriction, resolveRigidConstraint, Emitter, verlet, RepeatEvent } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(-42, 0)
}) => {
    const stem = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}fungus_stem.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.25 * size, scaleY: -0.25 * size,
        rotation: 0.5 * Math.PI,
        ambient
    })
    const marginal = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}fungus_margin.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.25 * size, scaleY: -0.25 * size,
        rotation: 0.5 * Math.PI,
        ambient
    })
    const cap = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}fungus_cap.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.25 * size, scaleY: -0.25 * size,
        rotation: 0.5 * Math.PI,
        x: spawnX, y: spawnY,
        ambient
    })
    
    const constraints = [{
        instance: marginal,
        target: cap,
        vertical: [0, 25],
        horizontal: [0, 0],
        offset: [0, -10],
        attract: [0, 0]
    }, {
        instance: stem,
        target: marginal,
        vertical: [0, 15],
        horizontal: [0, 0],
        offset: [0, 5],
        attract: [0, 0]
    }].map(constraint => axisAlignedRestriction({
        ...constraint,
        vertical: vec2.scale(constraint.vertical, size),
        horizontal: vec2.scale(constraint.horizontal, size),
        offset: vec2.scale(constraint.offset, size)
    }))
    
    const sporeParticles = Emitter(facade, {
        frequency: 0.24,
        spawnAmount: 0,
        maxCount: 128,
        emit: (stage, options) => stage.create({
            type: 'bitmap',
            x: marginal.x + size * Math.randomFloat(-10, 10),
            y: marginal.y + size * Math.randomFloat(-50, 0),
            pivotX: 0.5, pivotY: 0.5,
            friction: 0.95,
            velocity: [ size * Math.randomFloat(-80, 0), size * Math.randomFloat(0, 150) ],
            acceleration: [ Math.randomFloat(-60, 60), Math.randomFloat(-250, -150) ],
            timescale: 0.64,
            rotation: Math.randomFloat(0, Math.TAU),
            angularVelocity: Math.PI * Math.randomFloat(-0.75, 0.75),
            scale: size * Math.randomFloat(0.64, 1.5),
			z: 0.01 * Math.randomInt(-2, 5),
            texture: `${RECOLOR_PREFIX}spore.png`
        }),
        update: verlet({
            alpha: x => 0.64 * ease.circle(x),
            scaleX: (x, particle) => particle.scale * ease.sine(0.84*x),
            scaleY: (x, particle)=> particle.scale * ease.sine(0.84*x),
            color: x => color.rgbHex(Array(3).fill(Math.min(1, 2 * (1-x)))),
            acceleration: x => vec2.fromAngle(Math.randomFloat(0, Math.TAU), x * 7200 * Math.randomFloat(0.75, 1))
        })
    })
    
    facade.procedure(RepeatEvent(4, (timeOffset, idx) => {
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/water.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: Math.randomFloat(0.05, 0.2),
            rate: Math.randomFloat(0.9, 1.1)
        })
    }))
    
    facade.procedure((deltaTime, time) => {
        const phaseTime = 0.5 * time * Math.PI + Math.PI
        sporeParticles.spawnAmount = 4 * Math.max(0, Math.sin(phaseTime - 1.0 * Math.PI))
        sporeParticles.update(deltaTime)
        
        velocity[1] = 60 * Math.sin(phaseTime)
        
        cap.x += deltaTime * velocity[0]
        cap.y += deltaTime * velocity[1]
        
        marginal.y += 60 * deltaTime * Math.sin(phaseTime - 0.5 * Math.PI)
        stem.y += 60 * deltaTime * Math.sin(phaseTime - 1.0 * Math.PI)
        
        constraints.forEach(resolveConstraint => resolveConstraint(deltaTime))
        
        if(!checkBoundaries(facade.instance, facade))
            facade.instance.delete()
    })
    
    facade.registerEventHandler('death', Death(facade, { frameset: 'explosion', size: size * 0.6 }), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 350 * size,
        update: health => stem.color = marginal.color = cap.color = color.rgbHex([1, health, health])
    }))
    
    return {
        velocity,
        coordinates: cap.coordinates,
        boundingRadius: 25
    }
}
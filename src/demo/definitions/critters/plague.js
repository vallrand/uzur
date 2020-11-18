import { terminate } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { RepeatEvent, Emitter, Tween, ease, verlet, Boid, resolveSoftConstraint } from '../../../lib/algorithms'
import { Death, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient
}) => {
    const pocket = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}plague_pocket.png`,
        pivotX: 0.3, pivotY: 0.55,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    const cocoon = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}plague_cocoon.png`,
        pivotX: 0.3, pivotY: 0.55,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    const cover = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}plague_cover.png`,
        pivotX: 0.3, pivotY: 0.55,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    const beak = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}plague_beak.png`,
        pivotX: 0.1, pivotY: 0.8,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    const torso = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}plague_torso.png`,
        pivotX: 0.3, pivotY: 0.6,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    const head = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}plague_head.png`,
        pivotX: 0.15, pivotY: 0.7,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    
    const constraints = [{
        instance: head,
        pivot: [7.5, -15],
        target: beak,
        offset: [5, -10],
        angleRange: [-0.15 * Math.PI, 0.15 * Math.PI],
        stiffness: 0.25
    }, {
        instance: torso,
        pivot: [20, -22.5],
        target: head,
        offset: [5, -5],
        angleRange: [-0.15 * Math.PI, 0.15 * Math.PI],
        stiffness: 0.25
    }, {
        instance: pocket,
        pivot: [5, -5],
        target: torso,
        offset: [5, -5],
        angleRange: [-0.1 * Math.PI, 1 * Math.PI],
        stiffness: 0.25
    }, {
        instance: cover,
        pivot: [5, -5],
        target: torso,
        offset: [5, -5],
        angleRange: [-1 * Math.PI, 0.1 * Math.PI],
        stiffness: 0.25
    }, { 
        instance: cocoon,
        pivot: [5, -5],
        target: torso,
        offset: [5, -5],
        angleRange: [-0.125 * Math.PI, 0.175 * Math.PI],
        stiffness: 0.25
    }]
    
    const poisonParticles = Emitter(facade, {
        frequency: 0.1,
        spawnAmount: 2,
        maxCount: 512,
        friction: 1,
        update: verlet({
            alpha: ease.linearGradient([0, 1, 1, 0]),
            scaleX: ease.linearGradient([0.5, 1, 2, 4, 4]),
            scaleY: ease.linearGradient([0.5, 1, 2, 4, 4])
        }),
        emit: (stage, emitter) => stage.create({
            type: 'bitmap',
            layer: facade.delegate.layers['liquid'].delegate,
            x: emitter.x,
            y: emitter.y,
            friction: emitter.friction,
            pivotX: 0.5, pivotY: 0.5,
            velocity: vec2.fromAngle(
                Math.randomFloat(
                    emitter.rotation + 0.64 * Math.PI - 0.1 * Math.PI,
                    emitter.rotation + 0.64 * Math.PI + 0.1 * Math.PI
                ),
                Math.randomFloat(200, 300)
            ),
            acceleration: [ Math.randomFloat(-20, 0), Math.randomFloat(-200, 50) ],
            rotation: Math.randomFloat(0, 2 * Math.PI),
            angularVelocity: Math.randomFloat(-0.25 * Math.PI, 0.25 * Math.PI),
            timescale: 0.5,
            texture: `${RECOLOR_PREFIX}poisson.png`,
            blend: 'add',
            color: 0x4f4f4f
        })
    })
    
    const target = vec2(0.25 * facade.width, facade.height * Math.randomFloat(-0.4, 0.4))
    const imposter = Boid({
        x: spawnX,
        y: spawnY,
        maxVelocity: 1e4
    })
    
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    const humming = x => Math.max(0, (0.7 + (1 + Math.cos(Math.PI + 4 * x)) * 0.15 * Math.cos(64 * x)) * (1 - Math.pow(Math.sin(2 * x - 0.5 * Math.PI), 4)))
    
    const updateCaustic = deltaTime => {
        poisonParticles.update(deltaTime)
        let weight = 0
        for(let i = poisonParticles.particles.length - 1; i >= 0; i--){
            let particle = poisonParticles.particles[i],
                dx = particle.coordinates[0] - objective.coordinates[0],
                dy = particle.coordinates[1] - objective.coordinates[1],
                radius = objective.boundingRadius + particle.scaleX * 10
            weight += particle.alpha * Math.max(0, radius * radius - (dx*dx + dy*dy))
        }
        if(weight > 1000)
            objective.handle('damage', { value: 5 * deltaTime, type: 'continuous' })
    }
    
    const plagueLoop = facade.create({
        type: 'sound',
        track: 'assets/sfx/fly_loop.mp3',
        layer: facade.delegate.channels.sfx,
        volume: 0.5,
        loop: true,
        rate: 1
    })
    plagueLoop.play({ fadeIn: 0.1 })
    
    facade.procedure((deltaTime, time) => {
        constraints[2].angleRange[0] = Math.lerp(-0.1 * Math.PI, 0.1 * Math.PI, humming(time * 0.5))
        constraints[3].angleRange[1] = Math.lerp(0.1 * Math.PI, -0.24 * Math.PI, humming(time * 0.5))
        
        imposter.seek(target, 50)(deltaTime)
        imposter.integrate(deltaTime)
        
        beak.rotation = poisonParticles.rotation = Math.lerp(-0.1 * Math.PI, 0.1 * Math.PI, 0.5 + 0.5 * Math.sin(time * 5))
        beak.x = poisonParticles.x = imposter.coordinates[0]
        beak.y = poisonParticles.y = imposter.coordinates[1]
        updateCaustic(deltaTime)
        
        constraints.forEach(constraint => resolveSoftConstraint(constraint)(deltaTime))
        
        plagueLoop.position = facade.instance.coordinates
    })
    
    facade.procedure(RepeatEvent(4, (timeOffset, idx) => {
        if(Math.randomFloat(0, 1) > 1 / 3){
            let [ x, y ] = vec2.fromAngle(Math.randomFloat(-0.75 * Math.PI, 0.25 * Math.PI), Math.randomFloat(50, 250))
            x += objective.coordinates[0]
            y += objective.coordinates[1]

            target[0] = Math.clamp(x, -0.5 * facade.width + 50, 0.5 * facade.width - 50)
            target[1] = Math.clamp(y, -0.5 * facade.height + 50, 0.5 * facade.height - 50)
        }else{
            target[0] = facade.width * Math.randomFloat(-0.4, 0.4)
            target[1] = facade.height * Math.randomFloat(-0.4, 0.4)
        }
    }))
    
    facade.registerEventHandler('death', payload => new Promise(next => {
        facade.instance.alive = false
        poisonParticles.spawnAmount = 0
        plagueLoop.stop({ fadeOut: 0.5 })
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/flatter.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })
        
        facade.procedure((deltaTime, time) => {
            constraints[0].angleRange[0] = constraints[0].angleRange[1] = Math.lerp(-0.5 * Math.PI, 0.5 * Math.PI, ease.sine(8 * time))   
            vec2.copy(imposter.coordinates, target)
            if(!poisonParticles.particles.length)
                return next(), terminate
        })
    }), false)
    facade.registerEventHandler('death', Death(facade, { frameset: 'blood', size: 1.2 }), false)
    
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 1750,
        update: health => 
            pocket.color = cocoon.color = cover.color = beak.color = torso.color = head.color = color.rgbHex([1, health, health])
    }))
    
    return {
        velocity: imposter.velocity,
        get coordinates(){ return vec2.add(imposter.coordinates, [70, -50]) },
        boundingRadius: 50
    }
}
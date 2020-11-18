import { terminate } from '../../../../lib/util'
import { vec2, vec3, color } from '../../../../lib/math'
import { EntityGroup } from '../../../../lib/app/framework'
import { RepeatEvent, Tween, ease, MotionMixer, resolveRigidConstraint, checkBoundaries } from '../../../../lib/algorithms'
import { Lifecycle } from '../../effects'
import { RECOLOR_PREFIX } from '../../adjustTone'

import Death from './death'

import liberationMode from './liberation'
import defenseMode from './defense'
import offenseMode from './offense'
import { Cobweb } from './cobweb'

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient
}) => {    
    const back = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}cancer_back.png`,
        pivotX: 0.55, pivotY: 0.5,
        scaleX: 0.5, scaleY: 0.5,
        z: -0.1,
        ambient
    })
    
    const source = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}cancer_source.png`,
        pivotX: 0.54, pivotY: 0.52,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    
    const mouth = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}cancer_mouth.png`,
        pivotX: 0.55, pivotY: 0.5,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    })
    
    const carapace = facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}cancer_carapace.png`,
        pivotX: 0.55, pivotY: 0.5,
        scaleX: 0.5, scaleY: 0.5,
        ambient,
        x: spawnX,
        y: spawnY
    })
    
    const constraints = [{
        instance: mouth,
        target: carapace,
        offset: vec2(0, 0)
    }, {
        instance: back,
        target: carapace,
        offset: vec2(0, 0)
    }, {
        instance: source,
        target: carapace,
        offset: [-5, 5],
        angleOffset: 0
    }]
    
    facade.procedure((deltaTime, time) => {
        constraints[2].angleOffset = Math.mod(1.0 * time, 2 * Math.PI)
        constraints.forEach(resolveRigidConstraint)
    }, -1)
    
    const cartridges = Array.range(4).map(index => facade.create({
        type: 'bitmap',
        texture: `${RECOLOR_PREFIX}cancer_cartridge.png`,
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 0.5, scaleY: 0.5,
        ambient
    }))
    
    cartridges.map((cartridge, index) => ({
        instance: cartridge,
        target: carapace,
        offset: vec2(0, 0),
        phase: index * 2 * Math.PI / cartridges.length
    })).forEach(constraint => facade.procedure((deltaTime, time) => {
        time *= 0.5
        
        let radius = Math.lerp(20, 40, ease.sine(time * 0.5))
        
        constraint.offset[0] = 100 + 10 * Math.cos(time * 5 + constraint.phase)
        constraint.offset[1] = radius * Math.sin(time * 5 + constraint.phase)
        resolveRigidConstraint(constraint)
        constraint.instance.z = Math.cos(time * 5 + constraint.phase) < 0 ? -0.1 : 0.1
    }))
    
    
    const clawAmount = 3
    
    const clawMotionWeights = {
        defenseMode: 0,
        offenseMode: 0,
        liberationMode: 0
    }
    
    facade.registerEventHandler('defenseMode', payload => {
        facade.procedure(Tween({
            target: clawMotionWeights,
            duration: 0.5,
            defenseMode: 1,
            offenseMode: 0,
            liberationMode: 0
        }))
    })
    facade.registerEventHandler('offenseMode', payload => {
        facade.procedure(Tween({
            target: clawMotionWeights,
            duration: 0.5,
            defenseMode: 0,
            offenseMode: 1,
            liberationMode: 0
        }))
    })
    facade.registerEventHandler('liberationMode', payload => {
        facade.procedure(Tween({
            target: clawMotionWeights,
            duration: 0.5,
            defenseMode: 0,
            offenseMode: 0,
            liberationMode: 1
        }))
    })
    
    const claws = Array.range(2 * clawAmount).map(index => {
        const side = index % 2 ? 1 : -1
        
        const base = facade.create({
            type: 'bitmap',
            texture: `${RECOLOR_PREFIX}cancer_claw_base.png`,
            pivotX: 0.065, pivotY: 0.5,
            scaleX: 0.5, scaleY: side * 0.5,
            ambient
        })
        
        const arm = facade.create({
            type: 'bitmap',
            texture: `${RECOLOR_PREFIX}cancer_claw_arm.png`,
            pivotX: 0.4, pivotY: 0.5,
            scaleX: 0.5, scaleY: side * 0.5,
            ambient
        })
        
        const end = facade.create({
            type: 'bitmap',
            texture: `${RECOLOR_PREFIX}cancer_claw_end.png`,
            pivotX: 0.675, pivotY: 0.5,
            scaleX: 0.5, scaleY: side * 0.5,
            ambient
        })
        
        const constraints = [{
            instance: base,
            target: carapace,
            offset: [48, side * -42],
            angleOffset: 0
        }, {
            instance: arm,
            target: base,
            offset: [80, 0],
            angleOffset: 0
        }, {
            instance: end,
            target: arm,
            offset: [60, 0],
            angleOffset: 0
        }]
        
        const timeOffset = 1 / clawAmount * ((index / 2) | 0)
        
        const motion = MotionMixer({
            defenseMode: [
                time => Math.lerp(side * -0.75 * Math.PI, side * -0.1 * Math.PI,
                                  ease.sine(time * 0.5 + timeOffset)),
                time => Math.lerp(side * 0.2 * Math.PI, side * -0.2 * Math.PI,
                                  ease.sine(2 * time * 0.5 + timeOffset)),
                time => Math.lerp(side * 0.4 * Math.PI, side * -0.4 * Math.PI,
                                  ease.sine(2 * time * 0.5 + timeOffset))
            ],
            offenseMode: [
                time => Math.lerp(side * -0.5 * Math.PI, side * -0.1 * Math.PI,
                                  ease.sine(time * 0.5 + timeOffset + 0.0)),
                time => Math.lerp(side * -0.25 * Math.PI, side * 0.15 * Math.PI,
                                  ease.sine(time * 0.5 + timeOffset - 0.25)),
                time => Math.lerp(side * -0.3 * Math.PI, side * 0.3 * Math.PI,
                                  ease.sine(time * 0.5 + timeOffset - 0.5))
            ],
            liberationMode: [
                time => Math.lerp(side * -0.5 * Math.PI, side * -0.2 * Math.PI,
                                  ease.sine(2 * time * 0.5 + timeOffset + 0.0)),
                time => Math.lerp(side * 0.5 * Math.PI, side * -0.5 * Math.PI,
                                  ease.sine(1 * time * 0.5 + timeOffset - 0.125)),
                time => Math.lerp(side * -0.5 * Math.PI, side * 0.5 * Math.PI,
                                  ease.sine(1 * time * 0.5 + timeOffset - 0.25))
            ]
        })
        
        facade.procedure((deltaTime, time) => {
            const [ offset0, offset1, offset2 ] = motion(clawMotionWeights, time)
            constraints[0].angleOffset = offset0
            constraints[1].angleOffset = offset1
            constraints[2].angleOffset = offset2
            constraints.forEach(resolveRigidConstraint)
        })
    })
    
    facade.registerEventHandler('pulse', ({ position, velocity, target }) => {
        const plasma = facade.create({
            type: 'bitmap',
            texture: 'plasma.png',
            pivotX: 0.5, pivotY: 0.5,
            scaleX: 0.36, scaleY: 0.36,
            x: position[0],
            y: position[1]
        })
        
        const flash = facade.create({
            type: 'bitmap',
            texture: 'muzzle.png',
            pivotX: 0.5, pivotY: 0.5,
            scaleX: 0, scaleY: 0,
            alpha: 0,
            rotation: Math.randomFloat(0, 2 * Math.PI),
            x: position[0] - 25,
            y: position[1],
            z: 0.2,
            blend: 'add'
        })
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/flash.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })

        facade.procedure(Tween({
            target: flash,
            duration: 0.24,
            scaleX: 1.36 * (1 - Math.randomInt(0, 1) * 2),
            scaleY: 1.36,
            alpha: 0.75,
            rotation: flash.rotation + Math.randomFloat(-1.5*Math.PI, 1.5*Math.PI),
            ease: ease.fade,
            end: flash.delete.bind(flash)
        }))
        
        facade.procedure(deltaTime => {
            plasma.x += 60 * deltaTime * velocity[0]
            plasma.y += 60 * deltaTime * velocity[1]
            plasma.rotation = Math.atan2(velocity[1], velocity[0])

            const dx = target.coordinates[0] - plasma.coordinates[0]
            const dy = target.coordinates[1] - plasma.coordinates[1]
            const radius = target.boundingRadius + 15
            if(radius*radius > dx*dx + dy*dy)
                return plasma.delete(), target.handle('damage', { value: 10, type: 'impact' }), terminate
            
            if(!checkBoundaries(plasma, facade.stage))
                return plasma.delete(), terminate
        })
    })
    
    facade.registerEventHandler('defenseMode', defenseMode(facade.scope(), { target: carapace }))
    facade.registerEventHandler('offenseMode', offenseMode(facade.scope(), { target: carapace, cartridges }))
    facade.registerEventHandler('liberationMode', liberationMode(facade.scope(), { target: carapace }))
    
    const larvaGroup = facade.group()
    facade.registerEventHandler('spawn', payload => {
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/hatch.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.95, 1.05)
        })
        
        larvaGroup.create('larva', {
            target: carapace,
            distance: 200,
            ambient
        })
    })

    facade.procedure(Cobweb(facade, {
        components: larvaGroup.entities,
        linkDistance: 100,
        linkStretch: 100,
        stiffness: 0.05,
        textures: Array.range(3).map(idx => `${RECOLOR_PREFIX}larva_link_${idx}.png`),
        z: -0.02,
        ambient
    }))
    
    const switchMode = modes => {
        const index = Math.randomInt(1, modes.length - 1)
        const [ mode ] = modes.splice(index, 1)
        facade.instance.handle(mode)
            .then(switchMode.bind(null, [ mode, ...modes ]))
    }
    switchMode(['liberationMode','offenseMode','defenseMode'])
    
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 5000,
        filter: () => carapace.x < 350 ? 1 : 0,
        update: health => source.color = color.rgbHex(vec3(health))
    }))
    facade.registerEventHandler('death', Death(facade, { source, larvaGroup }), false)
    
    return {
        coordinates: carapace.coordinates,
        boundingRadius: 75
    }
}
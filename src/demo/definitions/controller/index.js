import { vec2, color } from '../../../lib/math'
import { Tween, ease, Emitter, verlet } from '../../../lib/algorithms'
import { RECOLOR_PREFIX } from '../adjustTone'

import { Corvette } from './corvette'

import { WebTechnique } from './web'
import { LiquidTechnique } from './liquid'
import { SwarmTechnique } from './swarm'

import { IndicatorPanel } from './indicator'

const consumable = [
    'larva', 'life', 'mind', 'fibrous', 'crinite', 'sulphur', 'tubular'
]

export const controller = facade => {
    const corvette = Corvette(facade, `${RECOLOR_PREFIX}assets/textures/corvette.png`)
    
    function processMovement({ width, height, delegate: { input } }, head){        
        const speed = 2
        const movement = [0, 0]
        
        if(input.left) movement[0] = -speed
        else if(input.right) movement[0] = speed
        if(input.up) movement[1] = -speed
        else if(input.down) movement[1] = speed

        const boundaryNear = 100
        const left = Math.min(1, (-0.5 * (width - 50) - head[0]) / -boundaryNear)
        const right = Math.min(1, (0.5 * (width - 50) - head[0]) / boundaryNear)
        const bottom = Math.min(1, (-0.5 * (height - 50) - head[1]) / -boundaryNear)
        const top = Math.min(1, (0.5 * (height - 50) - head[1]) / boundaryNear)
        
        movement[0] *= movement[0] > 0 ? right : left
        movement[1] *= movement[1] > 0 ? top : bottom

        movement[0] = 1e-2 * Math.floor(movement[0] * 1e2)
        movement[1] = 1e-2 * Math.floor(movement[1] * 1e2)

        return movement[0] || movement[1] ? movement : null
    }
    
    const indicator = IndicatorPanel(facade, {
        health: {
            value: 100,
            capacity: 100,
            refillRate: 0
        },
        liquid: {
            capacity: 5000,
            refillRate: 400
        },
        web: {
            capacity: 1,
            refillRate: 0.5
        },
        swarm: {
            capacity: 8,
            refillRate: 8
        }
    })
    indicator.health.enabled = true
    
    const flash = facade.create({
        type: 'bitmap',
        texture: 'star.png',
        pivotX: 0.5, pivotY: 0.5,
        alpha: 0,
        blend: 'add',
        z: 2
    })
    
    let heatMeter = 1
    facade.procedure((deltaTime, time) => {
        corvette.color = [ 0.75 + 0.25 * heatMeter, heatMeter, heatMeter ]
        heatMeter = Math.min(1, heatMeter + 1 * deltaTime)
        
        const movement = processMovement(facade, corvette.coordinates) || [ 0, 0.4 * Math.sin(10 * time) ]
        corvette.update(deltaTime, movement)
        
        flash.x = corvette.coordinates[0]
        flash.y = corvette.coordinates[1]
        
        const techniqueIdx = indicator.web.enabled + 2 * indicator.liquid.enabled + 3 * indicator.swarm.enabled
        
        if(facade.delegate.input.toggle){
            facade.delegate.input.toggle = false
            facade.instance.handle('swap', { technique: ['web', 'liquid', 'swarm', null][techniqueIdx] })
        }
        
        if(!techniqueIdx && facade.delegate.input.action){
            facade.delegate.input.action = false
            facade.instance.handle('death')
        }
        if(techniqueIdx) return
        
        const neighbours = facade.delegate.queryNeighbours(corvette.coordinates, facade.instance.boundingRadius)
        .filter(neighbour => consumable.indexOf(neighbour.type) != -1)
        
        neighbours.forEach(neighbour => {
            neighbour.handle('death')
            corvette.addWave()
            facade.instance.handle('damage', { value: 5, type: 'continuous' })
        })
        if(neighbours.length)
            facade.delegate.playSequentialSound({
                track: 'assets/sfx/gulp.mp3',
                loop: false,
                position: facade.instance.coordinates,
                volume: 0.5,
                rate: Math.randomFloat(0.9, 1.1)
            })
    })
    
    facade.registerEventHandler('swap', ({ technique }) => {
        facade.procedure(Tween({
            target: flash,
            duration: 0.24,
            scaleX: [0, 2],
            scaleY: [0, 2],
            alpha: [0, 2],
            rotation: [Math.randomFloat(0, Math.TAU), Math.randomFloat(0, Math.TAU)],
            ease: ease.fade,
        }))
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/swap.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: Math.randomFloat(0.9, 1.1)
        })
        
        indicator.web.enabled = indicator.web.value = 0
        indicator.liquid.enabled = indicator.liquid.value = 0
        indicator.swarm.enabled = indicator.swarm.value = 0
        indicator.swarm.rate = 1
        if(indicator[technique]) indicator[technique].enabled = true
    })
    
    WebTechnique(facade, { indicator: indicator.web, hull: corvette })
    LiquidTechnique(facade, { indicator: indicator.liquid, hull: corvette })
    SwarmTechnique(facade, { indicator: indicator.swarm, hull: corvette })
    
    facade.registerEventHandler('death', payload => {
        if(!facade.instance.alive) return
        facade.instance.alive = false
        
        facade.delegate.playSequentialSound({
            track: 'assets/sfx/shockwave.mp3',
            loop: false,
            position: facade.instance.coordinates,
            volume: 0.5,
            rate: 1
        })
        
        const sourceLocation = vec2.copy(facade.instance.coordinates)
        facade.procedure(facade.delegate.layers['shockwave']({
            source: sourceLocation,
            update: time => {
                facade.delegate.queryNeighbours(sourceLocation, 0.8 * facade.width * time)
                    .forEach(neighbour => neighbour.handle('death'))
            },
            end: () => {
                indicator.health.value = indicator.health.limit
                facade.instance.alive = true
            }
        }))
    })
    
    facade.registerEventHandler('damage', ({ value, type }) => {
        indicator.health.value -= value
        
        if(indicator.health.value <= 0) return facade.instance.handle('death')
        
        if(type === 'impact'){
            const hit = facade.create({
                type: 'bitmap',
                texture: 'light_particle.png',
                pivotX: 0.5, pivotY: 0.5,
                z: 2, blend: 'add'
            })
            
            facade.delegate.playSequentialSound({
                track: 'assets/sfx/damage.mp3',
                loop: false,
                position: facade.instance.coordinates,
                volume: 0.5,
                rate: Math.randomFloat(0.9, 1.1)
            })
            
            facade.procedure(Tween({
                target: hit,
                duration: 0.25,
                scaleX: [0, 3],
                scaleY: [0, 3],
                alpha: [0, 2],
                rotation: [Math.randomFloat(0, Math.TAU), Math.randomFloat(0, Math.TAU)],
                ease: ease.fade,
                update: time => {
                    hit.x = facade.instance.coordinates[0]
                    hit.y = facade.instance.coordinates[1]
                },
                end: hit.delete.bind(hit)
            }))
            
            heatMeter = Math.max(0, heatMeter - 0.5)
        }else if(type === 'continuous'){
            heatMeter = Math.max(0, heatMeter - 0.1)
        }
    })
    
    return {
        get coordinates(){ return corvette.coordinates },
        get boundingRadius(){ return 25 }
    }
}
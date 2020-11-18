import { vec2, color } from '../../../lib/math'
import { resolveRigidConstraint } from '../../../lib/algorithms'

const Indicator = factory => (facade, {
    capacity = 1,
    refillRate = 0,
    value = 0,
    enabled = false
}) => {
    let rate = 1
    const update = factory(facade)
    facade.procedure(deltaTime => {
        value = Math.clamp(value + deltaTime * rate * refillRate, 0, capacity)
        update(enabled ? value / capacity : null, deltaTime)
    })
    
    return {
        get value(){ return value },
        set value(input){ value = Math.clamp(input, 0, capacity) },
        get limit(){ return capacity },
        get rate(){ return rate },
        set rate(input){ rate = input },
        get enabled(){ return enabled },
        set enabled(input){ enabled = input }
    }
}

const HealthBar = Indicator(facade => {
    const healthBarBack = facade.create({
        type: 'bitmap',
        texture: 'health_bar_back.png',
        pivotX: 0, pivotY: 1,
        x: -facade.width, y: facade.height,
        z: 256
    })
    const healthBar = facade.create({
        type: 'bitmap',
        texture: 'blank.png',
        pivotX: 0, pivotY: 0.5,
        color: color.rgbHex([0.9, 0.1, 0.1]),
        scaleX: 0, scaleY: 30,
        x: -0.5 * facade.width + 5, y: facade.height,
        z: 256
    })
    const healthBarCover = facade.create({
        type: 'bitmap',
        texture: 'health_bar_cover.png',
        pivotX: 0, pivotY: 1,
        x: -facade.width, y: facade.height,
        z: 256
    })
    
    return (value, deltaTime) => {
        if(value == null){
            const offsetY = 0.5 * facade.height + 50
            healthBar.y += 10 * deltaTime * (offsetY - healthBar.y)
        }else{
            const offsetY = 0.5 * facade.height - 25
            healthBar.y += 10 * deltaTime * (offsetY - healthBar.y)
            healthBar.scaleX += 10 * deltaTime * (158 * value - healthBar.scaleX)
        }
        
        resolveRigidConstraint({
            instance: healthBarBack,
            target: healthBar,
            offset: [-10, 30]
        })
        resolveRigidConstraint({
            instance: healthBarCover,
            target: healthBar,
            offset: [-10, 30]
        })
    }
})

const LiquidBar = Indicator(facade => {
    const greenBarBack = facade.create({
        type: 'bitmap',
        texture: 'green_bar_back.png',
        pivotX: 0, pivotY: 1,
        x: -facade.width, y: facade.height,
        z: 256
    })
    const liquidBar = facade.create({
        type: 'bitmap',
        texture: 'blank.png',
        pivotX: 0, pivotY: 0.5,
        color: color.rgbHex([0.3, 0.9, 0.5]),
        alpha: 0.9,
        scaleX: 0, scaleY: 29,
        x: -0.5 * facade.width + 13,
        y: facade.height,
        z: 256
    })
    const greenBarCover = facade.create({
        type: 'bitmap',
        texture: 'green_bar_cover.png',
        pivotX: 0, pivotY: 1,
        x: -facade.width, y: facade.height,
        z: 256
    })
    
    return (value, deltaTime) => {
        if(value == null){
            const offsetY = 0.5 * facade.height + 50
            liquidBar.y += 10 * deltaTime * (offsetY - liquidBar.y)
        }else{
            const offsetY = 0.5 * facade.height - 75
            liquidBar.y += 10 * deltaTime * (offsetY - liquidBar.y)
            liquidBar.scaleX += 10 * deltaTime * (120 * value - liquidBar.scaleX)
        }
        
        resolveRigidConstraint({
            instance: greenBarBack,
            target: liquidBar,
            offset: [-18, 80]
        })
        resolveRigidConstraint({
            instance: greenBarCover,
            target: liquidBar,
            offset: [-18, 80]
        })
    }
})

const WebRod = Indicator(facade => {
    const blueBarBack = facade.create({
        type: 'bitmap',
        texture: 'blue_bar_back.png',
        pivotX: 0, pivotY: 1,
        x: -0.5 * facade.width - 5, y: facade.height,
        z: 256
    })
    const blueBarRod = facade.create({
        type: 'bitmap',
        texture: 'blue_bar_rod.png',
        pivotX: 0, pivotY: 1,
        x: -0.5 * facade.width - 5, y: facade.height,
        z: 256
    })
    const blueBarCover = facade.create({
        type: 'bitmap',
        texture: 'blue_bar_cover.png',
        pivotX: 0, pivotY: 1,
        x: -0.5 * facade.width - 5, y: facade.height,
        z: 256
    })
    
    return (value, deltaTime) => {
        if(value == null){
            const offsetY = 0.5 * facade.height + 50
            blueBarRod.y += 10 * deltaTime * (offsetY - blueBarRod.y)
        }else{
            const offsetY = 0.5 * facade.height + 5
            blueBarRod.y += 10 * deltaTime * (offsetY - blueBarRod.y)
            const offsetX = -0.5 * facade.width - 5
            blueBarRod.x += 10 * deltaTime * (offsetX + -86 * value - blueBarRod.x)
        }
        blueBarBack.y = blueBarCover.y = blueBarRod.y
    }
})

const SwarmReserve = Indicator(facade => {
    const base = facade.create({
        type: 'bitmap',
        texture: 'red_bar_base.png',
        pivotX: 0, pivotY: 1,
        x: -0.5 * facade.width - 5, y: facade.height,
        z: 256
    })
    const segments = Array.range(8).map(idx => facade.create({
        type: 'bitmap',
        texture: 'red_bar_segment.png',
        pivotX: 0, pivotY: 1,
        x: -0.5 * facade.width - 5 + idx * 16,
        y: facade.height,
        z: 256
    }))
    
    return (value, deltaTime) => {
        if(value == null){
            const offsetY = 0.5 * facade.height + 50
            base.y += 10 * deltaTime * (offsetY - base.y)
        }else{
            const offsetY = 0.5 * facade.height + 5
            base.y += 10 * deltaTime * (offsetY - base.y)
            
            const filled = value * 8 | 0
            segments.forEach((segment, index) => segment.alpha += 10 * deltaTime * ((filled > index) -segment.alpha))
        }
        
        segments.forEach(segment => segment.y = base.y)
    }
})

export const IndicatorPanel = (facade, { health, liquid, web, swarm }) => ({
    swarm: SwarmReserve(facade, swarm),
    web: WebRod(facade, web),
    liquid: LiquidBar(facade, liquid),
    health: HealthBar(facade, health)
})

import { terminate } from '../../../../lib/util'
import { vec2, shortestAngle } from '../../../../lib/math'
import { RepeatEvent, DelayEvent, Tween, ease } from '../../../../lib/algorithms'

export default (facade, { target, cartridges, aimSpeed = 0.2 }) => payload => new Promise(next => {
    facade.procedure(Tween({
        target: target,
        duration: 0.5,
        rotation: target.rotation + shortestAngle(target.rotation, -Math.PI),
        y: 0,
        x: 200,
        end: next
    }))
}).then(() => new Promise(next => {
    let time = 2.5
    const maxCount = 20
    
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    facade.procedure(RepeatEvent(0.25, (timeOffset, idx) => {
        const cartridge = cartridges[Math.mod(idx, cartridges.length)]

        facade.procedure(Tween({
            target: cartridge,
            duration: 0.36,
            pivotX: [0.5, 1.2],
            ease: ease.split(0.25, ease.powerIn(4), x => Math.pow(1 - x, 3))
        }))

        facade.instance.handle('pulse', {
            position: [ cartridge.x, cartridge.y ],
            velocity: vec2.fromAngle(cartridge.rotation, 10),
            target: objective
        })

        if(idx >= maxCount)
            return (facade.procedure(DelayEvent(1.0, next)), terminate)
    }))
    
    facade.procedure(deltaTime => {
        time += deltaTime
        
        let dx = objective.coordinates[0] - target.x
        let dy = objective.coordinates[1] - target.y
        target.rotation += aimSpeed * shortestAngle(target.rotation, Math.atan2(dy, dx))
        
        target.y = Math.lerp(-0.15 * facade.height, 0.15 * facade.height, ease.sine(time * 0.1))
    })
})).then(facade.clear.bind(facade))
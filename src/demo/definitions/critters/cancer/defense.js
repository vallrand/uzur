import { terminate } from '../../../../lib/util'
import { vec2, shortestAngle } from '../../../../lib/math'
import { RepeatEvent, DelayEvent, Tween, ease } from '../../../../lib/algorithms'

export default (facade, { target }) => payload => new Promise(next => {
    facade.procedure(Tween({
        target: target,
        duration: 0.5,
        rotation: target.rotation + shortestAngle(target.rotation, 0),
        y: -0.25 * facade.height,
        x: 200,
        end: next
    }))
}).then(() => new Promise(next => {
    let time = 0.5
    const maxCount = 20
    
    facade.procedure(RepeatEvent(0.34, (timeOffset, idx) =>
        idx < maxCount ? facade.instance.handle('spawn', {
            position: [ target.x, target.y ],
            velocity: vec2.fromAngle(target.rotation + Math.PI, 10)
        }) : (facade.procedure(DelayEvent(1.0, next)), terminate)
    ))
    
    facade.procedure(deltaTime => {
        time += deltaTime
        target.rotation = Math.lerp(-0.2 * Math.PI, 0.2 * Math.PI, ease.sine(time * 0.5))
            
        target.y = Math.lerp(-0.25 * facade.height, 0.25 * facade.height, ease.sine(time * 0.5 + 1.75))
    })
})).then(facade.clear.bind(facade))
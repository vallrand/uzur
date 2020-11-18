import { vec2, color, shortestAngle } from '../../../../lib/math'
import { RepeatEvent, Tween, ease, resolveRigidConstraint } from '../../../../lib/algorithms'
import { energyBeam } from './energyBeam'

export default (facade, { target }) => payload => new Promise(next => {
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    facade.procedure(Tween({
        target: target,
        duration: 1.0,
        rotation: target.rotation + shortestAngle(target.rotation, -Math.PI),
        x: 380,
        y: objective.coordinates[1],
        ease: ease.powerInOut(2),
        end: next.bind(null, objective)
    }))
}).then(objective => new Promise(next => {
    const beam = facade.create({
        type: 'plane',
        shader: energyBeam,
        width: facade.width,
        height: facade.height,
        z: 0.2,
        blend: 'blend',
        strength: 0,
        time: 0,
        timeScale: 0,
        fillColor: color.copy([0.8, 0.4, 0.5])
    })
    
    facade.delegate.playSequentialSound({
        track: 'assets/sfx/beam.mp3',
        loop: false,
        volume: 0.5,
        rate: 1.08
    })
    
    facade.procedure(deltaTime => {
        beam.time += beam.timeScale * deltaTime * 50

        resolveRigidConstraint({
            instance: beam,
            target: target,
            offset: [380, 0]
        })
        
        if(beam.strength > 0.25 && Math.abs(objective.coordinates[1] - beam.coordinates[1]) < 50)
            objective.handle('damage', { value: 10 * deltaTime, type: 'continuous' })
    })
    
    facade.procedure(Tween({
        target: beam,
        duration: 5.0,
        strength: [0, 1.75],
        timeScale: [0, 1],
        ease: ease.sine,
        end: next
    }))
})).then(facade.clear.bind(facade))
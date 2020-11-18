import { Tween, ease, DelayEvent } from '../../../../lib/algorithms'
import { Animation } from '../../effects'

export default (facade, { source, larvaGroup }) => payload => {
    facade.instance.alive = false
    facade.instance.procedures.length = 0

    const remainingLarvas = larvaGroup.entities
    remainingLarvas.forEach(entity => {
        entity.alive = false
        entity.procedures.length = 0
    })

    facade.procedure(Tween({
        target: source,
        duration: 0.25,
        scaleX: 0, scaleY: 0
    }))
    
    facade.delegate.playSequentialSound({
        track: 'assets/sfx/blood_explosion.mp3',
        loop: false,
        position: facade.instance.coordinates,
        rate: Math.randomFloat(0.84, 1.16),
        volume: 0.5
    })
    
    facade.procedure(DelayEvent(2.5, timeOffset => facade.delegate.playSequentialSound({
        track: 'assets/sfx/dissipate.mp3',
        loop: false,
        volume: 0.36,
        rate: 1
    })))

    Animation(facade, {
        frameset: 'blood',
        x: source.coordinates[0],
        y: source.coordinates[1],
        scaleX: 1, scaleY: 1, z: 0,
        end: () => {
            source.delete()
            facade.procedure(facade.delegate.layers['dissipate']({
                components: [
                    ...facade.instance.components,
                    ...remainingLarvas.map(entity => entity.components).flatten()
                ],
                end: facade.instance.delete.bind(facade.instance)
            }))
        }
    })

}
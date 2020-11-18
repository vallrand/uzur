import { vec2, mat3, vec3, vec4 } from '../../../lib/math'
import { DelayEvent, Tween, ease } from '../../../lib/algorithms'
import { Animation } from './frameAnimation'

export const Death = (facade, { frameset, size = 1 }) => payload => {
    facade.instance.alive = false
    facade.instance.procedures.length = 0
    
    const velocitySnapshot = vec2.copy(facade.instance.velocity)
    facade.procedure(deltaTime => facade.instance.components.forEach(component => {
        component.x += deltaTime * velocitySnapshot[0]
        component.y += deltaTime * velocitySnapshot[1]
    }))
    
    facade.instance.components.forEach(component => facade.procedure(Tween({
        target: component,
        duration: 0.24,
        scaleX: 0, scaleY: 0,
        ease: ease.powerIn(3)
    })))
        
    facade.delegate.playSequentialSound({
        track: `assets/sfx/${frameset === 'blood' ? 'blood_explosion' : 'explosion'}.mp3`,
        loop: false,
        position: facade.instance.coordinates,
        rate: Math.randomFloat(0.84, 1.16),
        volume: 0.5
    })

    Animation(facade, {
        frameset,
        x: facade.instance.coordinates[0],
        y: facade.instance.coordinates[1],
        scaleX: size, scaleY: size,
        end: facade.instance.delete.bind(facade.instance)
    })
    
}    

export const DissipateDeath = facade => payload => {
    facade.instance.alive = false
    facade.instance.procedures.length = 0

    facade.delegate.playSequentialSound({
        track: 'assets/sfx/dissolve.mp3',
        loop: false,
        position: facade.instance.coordinates,
        rate: Math.randomFloat(0.96, 1.04),
        volume: 0.5
    })
    
    facade.instance.components.forEach(component =>
        facade.delegate.layers['dissolve'].delegate.aquire(component))
    
    facade.procedure(DelayEvent(0.1, facade.instance.delete.bind(facade.instance)))
}
import { terminate } from '../../../lib/util'
import { vec2 } from '../../../lib/math'
import { motionRays } from './motionRays'

export const IntroTransition = (system, stage, { palette, centroid, swap, timeScale = 1 }) => {
    const transition = stage.create({
        type: 'plane',
        shader: motionRays,
        width: stage.width,
        height: stage.height,
        z: 64,
        time: 0,
        leftColor: palette.fade,
        rightColor: palette.primary,
        centroid: vec2(
            centroid[0] / stage.width + 0.5,
            centroid[1] / stage.height + 0.5,
        )
    })
    //TODO passing system and stage? "playSequentialSound" in right place?
    system.playSequentialSound({
        track: 'assets/sfx/transition.mp3',
        loop: false,
        volume: 0.5,
        rate: 1.1
    })
    
    return deltaTime => {
        transition.time += timeScale * 1.5 * deltaTime
        
        if(swap && transition.time >= 2 * Math.PI)
            swap = swap(), null
        
        if(transition.time > 4 * Math.PI)
            return transition.delete(), terminate
    }
}
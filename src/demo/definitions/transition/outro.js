import { terminate } from '../../../lib/util'
import { vec2, color } from '../../../lib/math'
import { ease, DelayEvent } from '../../../lib/algorithms'

export const OutroTransition = (system, stage, { palette, timeScale = 1, swap }) => {
    const fade = stage.create({
        type: 'bitmap',
        texture: 'blank.png',
        pivotX: 0.5, pivotY: 0.5,
        color: 0x000000,
        alpha: 0,
        scaleX: stage.width, scaleY: stage.height,
        x: 0, y: 0, z: 512
    })
    
    const fireworkAmount = 8
    const timeOffsets = Array.range(fireworkAmount).map(idx => Math.lerp(0, 5, ease.powerOut(2)(idx / (fireworkAmount - 1))))
    
    const fireworks = stage.create({
        type: 'trail',
        duration: 10,
        lifetime: 5,
        trailLength: 1.5,
        particles: timeOffsets.map(timeOffset => ({
            position: vec2(0.4 * stage.width * Math.randomFloat(-1, 1), 0.4 * stage.height * Math.randomFloat(-1, 1)),
            count: Math.randomInt(75, 150),
            forceRange: vec2(10, 75),
            width: 8,
            timeOffset
        })),
        gradient: [
            [[1,1,1,1],[...color.scale(palette.primary, 4),1],[...palette.primary,1]],
            [[...color.scale(palette.primary, 2),1],[...palette.primary,1],[...palette.fade,1]],
            [[...color.scale(palette.primary, 0.5),1],[...palette.fade,1],[...color.scale(palette.fade, 0.25),1]],
            [[...palette.fade,0],[0,0,0,0],[0,0,0,0]]
        ],
        z: 512 + 0.5
    })
    
    timeOffsets.forEach(timeOffset => system.procedure(DelayEvent(timeOffset / timeScale, () => {
        system.playSequentialSound({
            track: 'assets/sfx/fireworks.mp3',
            loop: false,
            volume: 0.5,
            rate: Math.pow(2, Math.randomInt(-4, 4) / 12)
        })
    })))
    
    let time = 0
    return deltaTime => {
        time += 0.1 * timeScale * deltaTime
        
        fireworks.time = fireworks.duration * time
        
        fade.alpha = time < 0.5 ? ease.powerOut(2)(2 * time) : 1 - ease.powerIn(2)(2 * time - 1)
        
        if(swap && time > 0.5)
            swap = swap(), null
            
        if(time > 1)
            return fade.delete(), fireworks.delete(), terminate
    }
}
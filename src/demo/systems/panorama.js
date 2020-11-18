import { terminate } from '../../lib/util'
import { vec2, mat3, mat3x2, color, vec3, vec4, colorMatrix } from '../../lib/math'
import { EventTimeline, DelayEvent, RepeatEvent } from '../../lib/algorithms'

import { generateLevel, generatePalette, OutroTransition, adjustTone } from '../definitions'

export const Panorama = (system, stage) => ({
    ['establish']: ({ palette, seed, radius }) => new Promise(next => {
        Math.random.reseed(seed)
        console.log('Entering: %cPanorama', 'color: #0000aa')
        console.log(`palette: ${Array(Object.keys(palette).length).fill('%c██').join('')}`,
                    ...Object.values(palette).map(rgb => `color:rgb(${rgb.map(n => 0xFF * n)})`))
        
		stage.backgroundColor = palette.fade
        
        adjustTone(stage, { palette })
        
        const background = system.create('background', { palette })
        const foreground = system.create('foreground', { palette })
        
        const musicThemes = ['jacobian','serpent','turbulence','wander']
        const theme = system.channels.music.create({
            type: 'sound',
            track: `assets/music/${musicThemes[Math.randomInt(0, musicThemes.length - 1)]}.mp3`,
            loop: true,
            volume: 0.36,
            rate: 1
        })
        theme.play({ fadeIn: 1 })
        
        const controller = system.create('controller')
        
        system.subscribe('end', payload => new Promise(next =>
            system.procedure(deltaTime =>
                !controller.alive ||
                system.queryAll(entity => entity.type != 'controller').length
                    ? true
                    : (controller.alive = false, next(), terminate))
        ), false)
        
        system.subscribe('end', payload => {
            theme.stop({ fadeOut: 2 })
            system.procedure(OutroTransition(system, stage, {
                palette,
                timeScale: 1.0,
                swap: () => {
                    background.delete()
                    foreground.delete()
                    controller.delete()
                    next()
                }
            }))
        }, false)
        
        console.log(`Generating level: %c[${radius}]`, 'color: #0000aa')
        system.procedure(EventTimeline(({ marker, genus, properties } = { marker: 'end' }, timeOffset) => {
            console.log(`Event: '%c${marker || genus}'`, 'color: #00bc55')
            if(marker)
                return system.dispatch(marker)
            else
                system.create(genus, {
                    ...properties,
                    timeOffset,
                    x: 0.5 * stage.width + 0.05 * stage.width,
                    y: 0.5 * stage.height * properties.y
                })
        })(generateLevel({
            waveCount: Math.lerp(4, 20, Math.pow(radius, 2)) | 0
        })))
    })
})
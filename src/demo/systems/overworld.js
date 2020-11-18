import { terminate } from '../../lib/util'
import { PoissonDisk } from '../../lib/algorithms'
import { vec2, mat3, mat3x2, color, vec3, vec4, colorMatrix } from '../../lib/math'

import { generatePalette, IntroTransition } from '../definitions'

export const Overworld = (system, stage) => ({
    ['overview']: payload => new Promise(next => {
        console.log('Entering: %cOverworld', 'color: #0000aa')
        
        const background = system.create('starfield')
        const ambience = system.channels.music.create({
            type: 'sound',
            track: 'assets/music/cosmic_interlude.mp3',
            loop: true,
            volume: 0.5,
            rate: 1
        })
        ambience.play({ fadeIn: 0.5 })
        
        const amount = Math.randomInt(2, 5),
              radiusRange = [50, 150],
              availableWidth = stage.width - 2 * radiusRange[1],
              availableHeight = stage.height - 2 * radiusRange[1]
        
        const planets = Array.range(amount)
        .map(PoissonDisk({
            width: availableWidth,
            height: availableHeight,
            radius: radiusRange[1]
        }))
        .filter(location => location)
        .sort((a, b) => a[0] - b[0])
        .map(([ x, y ], idx) => system.create('planet', {
            palette: generatePalette(),
            selected: !idx,
            location: `planetary_${idx}`,
            radius: Math.randomFloat(radiusRange[0], radiusRange[1]),
            x: x - 0.5 * availableWidth,
            y: y - 0.5 * availableHeight
        }))
        
        const selectDestination = payload => {
            ambience.stop({ fadeOut: 3 })
            system.procedure(IntroTransition(system, stage, {
                ...payload,
                timeScale: 1.0,
                swap: () => {
                    background.delete()
                    planets.forEach(planet => planet.delete())
                    next(payload)
                }
            }))
        }
        
        system.procedure(deltaTime => {
            const { input } = system
            
            if(input.left){
                input.left = false
                planets[0].selected = false
                planets.unshift(planets.pop())
                planets[0].selected = true
            }else if(input.right){
                input.right = false
                planets[0].selected = false
                planets.push(planets.shift())
                planets[0].selected = true
            }else if(input.action){
                input.action = false
                system.playSequentialSound({
                    track: 'assets/sfx/select.mp3',
                    loop: false,
                    volume: 0.5,
                    rate: 1
                })
                
                planets[0].selected = false
                return selectDestination({
                    ...planets[0].description,
                    radius: (planets[0].description.radius - radiusRange[0]) / (radiusRange[1] - radiusRange[0])
                }), terminate
            }
        })
    })
})
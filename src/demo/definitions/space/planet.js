import { vec2, color } from '../../../lib/math'
import { Tween, ease } from '../../../lib/algorithms'

import { terrain } from './terrain'

export default (facade, {
    x, y,
    radius,
    palette,
    location,
    selected
}) => {
    facade.stage.generateTexture({
        name: `${location}.tex`,
        render: stage => stage.create({
            type: 'plane',
            shader: terrain,
            width: stage.width,
            height: stage.height,
            time: Math.randomFloat(0, 100),
            backgroundColor: palette.fade,
            foregroundColor: palette.primary,
            middlegroundColor: palette.secondary
        })
    })
    
    const highlight = facade.create({
        type: 'bitmap',
        texture: 'circle_select.png',
        pivotX: 0.485, pivotY: 0.485,
        x, y,
        alpha: +selected
    })
    
    const sphere = facade.create({
        type: 'sphere',
        texture: `${location}.tex`,
        width: 2 * radius, height: 2 * radius,
        light: { position: [7.6, 0, 6.4] },
        x, y
    })
    
    const rotationSpeed = Math.randomFloat(0.1, 1.2)
    
    facade.procedure((deltaTime, time) => {
        sphere.y = y + radius * 0.16 * Math.sin(0.75 * time + x)
        sphere.rotation[1] = rotationSpeed * time
        sphere.rotation[0] = -0.25 * Math.PI * sphere.y / (0.5 * facade.height)
        
        highlight.scaleX = highlight.scaleY = (2 + 0.5 * ease.sine(1.25 * time)) * 0.01 * radius
        highlight.x = sphere.x
        highlight.y = sphere.y
    })
    
    return {
        description: {
            palette, radius,
            centroid: vec2(x, y),
            seed: Math.randomInt(0, 1e6)
        },
        get selected(){ return selected },
        set selected(value){
            facade.procedure(Tween({
                target: highlight,
                duration: 0.2,
                alpha: +value
            }))
            if(selected = value)
                facade.delegate.playSequentialSound({
                    track: 'assets/sfx/click.mp3',
                    loop: false,
                    volume: 0.5,
                    position: [ x, y ],
                    rate: Math.pow(2, Math.randomInt(-4, 4) / 12)
                })
        }
    }
}
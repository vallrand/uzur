import { color } from '../../../lib/math'
import { Tween } from '../../../lib/algorithms'

import { starmap } from './starmap'

export default (facade, options) => {    
    const background = facade.create({
        type: 'plane',
        shader: starmap,
        width: facade.width,
        height: facade.height,
        z: -64
    })
    facade.procedure((deltaTime, time) => {
        background.time = time
    })
}
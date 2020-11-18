import { cloth } from './cloth'
import { sky } from './sky'
import { clouds } from './clouds'
import { kaliset } from './kaliset'

const fabric = [ cloth, clouds, sky, kaliset ]

export const background = (facade, { palette }) => {
    const plane = facade.create({
        type: 'plane',
        shader: fabric[Math.randomInt(0, fabric.length - 1)],
        width: facade.width,
        height: facade.height,
        z: -256,
        backColor: palette.fade,
        frontColor: palette.primary
    })
    facade.procedure((deltaTime, time) => {
        plane.time = time * 10.0
    })
}
import { color } from '../../lib/math'

export const generatePalette = () => ({
    fade: color.hsl_rgb([
        Math.randomFloat(0, 1.0),
        Math.randomFloat(0.25, 0.75),
        Math.randomInt(0, 1) ? Math.randomFloat(0.1, 0.4) : Math.randomFloat(0.6, 0.9)
    ]),
    primary: color.hsl_rgb([ Math.randomFloat(0, 1.0), 1.0, 0.5 ]),
    secondary: color.hsl_rgb([ Math.randomFloat(0, 1.0), 1.0, 0.5 ])
})
import { color, colorMatrix } from '../../../lib/math'
import { ParallaxBackground } from './parallax'
import { RECOLOR_PREFIX } from '../adjustTone'

const foregroundSets = [
	'boulder', 'pillar', 'clot', 'disk', 'coral', 'pylon', 'cluster', 'block'
].map(setName => Array.range(8).map(idx => `${setName}_${idx}.png`))

const occasionalSets = [
    'crystal_heart', 'glow_cubes', 'glow_insect', 'glow_lamp', 'glow_mushroom',
	'ice_cacti', 'neuron_tree', 'shell_spike', 'tail_spike', 'tentacle_spike'
].map(setName => Array.range(4).map(idx => `${setName}_${idx+1}.png`))

const generateChunk = ({
    variants,
    color,
    density
}) => () => Array.range(density).map(idx => {
    const rotation = Math.randomFloat(-Math.PI/16, Math.PI/16)
    
    return {
        type: 'bitmap',
        texture: variants[Math.randomInt(0, variants.length - 1)],
        pivotX: 0.5 - 0.5 * Math.sign(rotation),
        pivotY: 1.0,
        rotation,
        color
    }
})

export const foreground = (facade, { palette }) => {
    const foregroundTextures = foregroundSets[Math.randomInt(0, foregroundSets.length - 1)]
    const occasionalTextures = occasionalSets[Math.randomInt(0, occasionalSets.length - 1)]
    
    facade.stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: occasionalTextures,
        colorMatrix: colorMatrix.hue(Math.PI * Math.randomFloat(-1, 1))
    })
    
    const parallax = ParallaxBackground(facade, {
        padding: 0.2,
        bottomLine: 320,
        chunkLength: facade.width,
        deviation: 0.4,
        layerAmount: 5,
        scaleRange: [1.2, 0.5],
        generators: [
            generateChunk({
                variants: foregroundTextures,
                color: color.rgbHex(palette.primary),
                density: 4
            }),
            generateChunk({
                variants: occasionalTextures.map(textureName => `${RECOLOR_PREFIX}${textureName}`),
                color: 0xFFFFFF,
                density: 1
            })
        ]
    })
    facade.procedure(deltaTime => {
        parallax.x += deltaTime * 160
        parallax.update(deltaTime)
    })
}
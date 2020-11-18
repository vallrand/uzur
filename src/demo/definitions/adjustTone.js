import { vec2, mat3, mat3x2, color, vec3, vec4, colorMatrix } from '../../lib/math'

export const RECOLOR_PREFIX = 'dc.'

export const adjustTone = (stage, { palette }) => {
    const top = color.rgb_hsl(palette.primary),
          bottom = color.rgb_hsl(palette.fade)
    
    const brightness = Math.lerp(0, 2, 0.75 * top[2] + 0.25 * bottom[2])
    const saturation = Math.lerp(-1, 1, 0.75 * top[2] + 0.25 * bottom[2])
    const contrast = Math.lerp(-0.5, 0.5, vec3.magnitude(vec3.subtract(palette.primary, palette.fade)) / Math.sqrt(3))
    const hue = Math.PI * Math.randomFloat(-1, 1)
    
    const adjustmentMatrix = colorMatrix.multiply(colorMatrix.multiply(
        colorMatrix.hue(hue), 
        colorMatrix.saturation(saturation)
    ), colorMatrix.multiply(
        colorMatrix.contrast(contrast),
        colorMatrix.brightness(brightness)
    ))
    
    stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: [
            'fibrous_cell.png', 'crinite_cell.png', 'sulphur_cell.png', 'tubular_cell.png',
            'life_cell_back.png', 'life_cell_heart.png', 'life_cell_front.png',
            'mind_cell_back.png', 'mind_cell_brain.png', 'mind_cell_front.png',
            'shell_0.png', 'shell_1.png', 'shell_2.png', 'shell_3.png',
            
            'squid_0.png', 'squid_1.png', 'squid_2.png', 'squid_3.png',
            'nucleus_left.png', 'nucleus_core.png', 'nucleus_right.png',
            'fungus_stem.png', 'fungus_margin.png', 'fungus_cap.png',
            
            'nerve_eye.png', 'nerve_head.png', 'nerve_tail.png',
            
            'nest_head.png', 'nest_tail.png', 'swarm.png',
            
            'hive_top.png', 'hive_torso.png', 'hive_mouth.png',
            
            'plague_pocket.png', 'plague_cocoon.png', 'plague_cover.png', 'plague_beak.png',
            'plague_torso.png', 'plague_head.png',
            
            'cancer_back.png', 'cancer_source.png', 'cancer_mouth.png', 'cancer_carapace.png', 'cancer_cartridge.png',
            'cancer_claw_base.png', 'cancer_claw_arm.png', 'cancer_claw_end.png',
            `larva_link_0.png`, `larva_link_1.png`, `larva_link_2.png`, 'larva_sleeping.png', 'larva_awake.png'
        ],
        colorMatrix: adjustmentMatrix
    })
    
    stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: [
            'shell_eye_glow.png', 'spore.png', 'poisson.png'
        ],
        colorMatrix: colorMatrix.hue(hue)
    })
    
    stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: ['assets/textures/tentacle.png'],
        colorMatrix: adjustmentMatrix
    })
    
    stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: ['assets/textures/blood_flow.png'],
        colorMatrix: adjustmentMatrix
    })
    
    stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: ['assets/textures/rival_fish.png'],
        colorMatrix: adjustmentMatrix
    })

    stage.prerender({
        prefix: RECOLOR_PREFIX,
        textures: ['assets/textures/corvette.png'],
        colorMatrix: colorMatrix.multiply(colorMatrix.hue(Math.randomFloat(-Math.PI, Math.PI)), colorMatrix.contrast(0.16))
    })
}
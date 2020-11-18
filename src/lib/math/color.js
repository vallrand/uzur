import { vec3 } from './vec3'

export const color = (...args) => vec3(...args)
Object.setPrototypeOf(color, vec3)

color.normalize = (rgb, out = color()) => {
    out[0] = rgb[0] / 0xFF
    out[1] = rgb[1] / 0xFF
    out[2] = rgb[2] / 0xFF
    return out
}

color.rgb_hsl = ([ r, g, b ], out = color()) => {
    const max = Math.max(r, g, b),
          min = Math.min(r, g, b)
    let h, s, l = 0.5 * (max + min)
    
    if(min == max) return color.copy([ 0, 0, l ], out)
    
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch(max){
        case r: 
            h = (g - b) / d + (g < b ? 6 : 0)
            break
        case g: 
            h = (b - r) / d + 2
            break
        case b: 
            h = (r - g) / d + 4
            break
    }
    
    out[0] = h / 6
    out[1] = s
    out[2] = l
    return out
}

color.hsl_rgb = ([ h, s, l ], out = color()) => {
    if(s == 0) return color.copy([ 1, 1, 1 ], out)
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    const hue_rgb = (p, q, t) => {
        t = Math.mod(t, 1.0)
        if(t < 1/6) return p + (q - p) * 6 * t
        else if(t < 1/2) return q
        else if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
        else return p
    }
    
    out[0] = hue_rgb(p, q, h + 1/3)
    out[1] = hue_rgb(p, q, h)
    out[2] = hue_rgb(p, q, h - 1/3)
    return out
}

color.rgbHex = color =>
    ((color[0] * 0xFF | 0) << 16) + 
    ((color[1] * 0xFF | 0) << 8) + 
    ((color[2] * 0xFF | 0))
color.pack = (rgb, alpha) =>
(rgb >> 16) + (rgb & 0xFF00) + ((rgb & 0xFF) << 16) + (alpha * 0xFF << 24)

export const colorMatrix = () => new Float32Array(20)

colorMatrix.identity = (out = colorMatrix()) => {
    out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0; out[4] = 0
    out[5] = 0; out[6] = 1; out[7] = 0; out[8] = 0; out[9] = 0
    out[10] = 0; out[11] = 0; out[12] = 1; out[13] = 0; out[14] = 0
    out[15] = 0; out[16] = 0; out[17] = 0; out[18] = 1; out[19] = 0
    return out
}

colorMatrix.multiply = (a, b, out = colorMatrix()) => {
    const a00 = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15])
    const a01 = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16])
    const a02 = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17])
    const a03 = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18])
    const a04 = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]) + a[4]

    const a10 = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15])
    const a11 = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16])
    const a12 = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17])
    const a13 = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18])
    const a14 = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]) + a[9]

    const a20 = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15])
    const a21 = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16])
    const a22 = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17])
    const a23 = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18])
    const a24 = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]) + a[14]

    const a30 = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15])
    const a31 = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16])
    const a32 = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17])
    const a33 = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18])
    const a34 = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]) + a[19]
    
    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03; out[4] = a04 / 255
    out[5] = a10; out[6] = a11; out[7] = a12; out[8] = a13; out[9] = a14 / 255
    out[10] = a20; out[11] = a21; out[12] = a22; out[13] = a23; out[14] = a24 / 255
    out[15] = a30; out[16] = a31; out[17] = a32; out[18] = a33; out[19] = a34 / 255
    
    return out
}

colorMatrix.brightness = (v, out = colorMatrix()) => {
    out.set([
        v, 0, 0, 0, 0,
        0, v, 0, 0, 0,
        0, 0, v, 0, 0,
        0, 0, 0, 1, 0,
    ])
    return out
}

colorMatrix.greyscale = (scale, out = colorMatrix()) => {
    out.set([
        scale[0], scale[1], scale[2], 0, 0,
        scale[0], scale[1], scale[2], 0, 0,
        scale[0], scale[1], scale[2], 0, 0,
        0, 0, 0, 1, 0,
    ])
    return out
}

colorMatrix.hue = (rotation = 0, out = colorMatrix()) => {
    const cos = Math.cos(rotation),
          sin = Math.sin(rotation),
          weight = 1 / 3,
          sqrtWeight = Math.sqrt(weight)
    
    const a00 = cos + weight * (1.0 - cos)
    const a01 = weight * (1.0 - cos) - sqrtWeight * sin
    const a02 = weight * (1.0 - cos) + sqrtWeight * sin

    const a10 = weight * (1.0 - cos) + sqrtWeight * sin
    const a11 = cos + weight * (1.0 - cos)
    const a12 = weight * (1.0 - cos) - sqrtWeight * sin

    const a20 = weight * (1.0 - cos) - sqrtWeight * sin
    const a21 = weight * (1.0 - cos) + sqrtWeight * sin
    const a22 = cos + weight * (1.0 - cos)
    
    out.set([
        a00, a01, a02, 0, 0,
        a10, a11, a12, 0, 0,
        a20, a21, a22, 0, 0,
        0, 0, 0, 1, 0
    ])
    return out
}

colorMatrix.contrast = (amount, out = colorMatrix()) => {
    const v = (amount || 0) + 1
    const o = -0.5 * (v - 1)
    
    out.set([
        v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, 1, 0
    ])
    return out
}

colorMatrix.saturation = (amount, out = colorMatrix()) => {
    const x = amount * 2 / 3 + 1
    const y = (x - 1) * -0.5
    
    out.set([
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0
    ])
    return out
}

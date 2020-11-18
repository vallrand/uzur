import { vec2, vec3 } from '../../math'

const GRADIENTS3 = [
    vec3(1,1,0), vec3(-1,1,0), vec3(1,-1,0), vec3(-1,-1,0),
    vec3(1,0,1), vec3(-1,0,1), vec3(1,0,-1), vec3(-1,0,-1),
    vec3(0,1,1), vec3(0,-1,1), vec3(0,1,-1), vec3(0,-1,-1)
]
const PERLIN = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,
    6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,
    68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,
    143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,
    3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,
    170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
    178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,
    192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,
    128,195,78,66,215,61,156,180
]

const F2 = 0.5 * (Math.sqrt(3) - 1),
      G2 = (3 - Math.sqrt(3)) / 6,
      F3 = 1 / 3,
      G3 = 1 / 6

const fade = v => v * v * v * (v * (v * 6 - 15) + 10)
const lerp = (a, b, f) => (1 - f) * a + f * b

export const Noise = seed => {
    const permutations = new Array(512),
          perlinGradients = new Array(512)
    if(1 > seed && seed > 0) seed *= 0xFFFF
    seed = Math.floor(seed)
    if(seed <= 0xFF) seed |= seed << 8
    for(let i = 0; i <= 0xFF; i++){
        let value = i & 1 ?
            PERLIN[i] ^ (seed & 0xFF) : 
            PERLIN[i] ^ ((seed >> 8) & 0xFF)
        permutations[i] = permutations[i + 0x100] = value
        perlinGradients[i] = perlinGradients[i + 0x100] = GRADIENTS3[value % GRADIENTS3.length]
    }
    return {
        simplex2: (xin, yin) => {
            let s = (xin+yin)*F2,
                i = Math.floor(xin+s),
                j = Math.floor(yin+s),
                t = (i+j)*G2,
                x0 = xin-i+t,
                y0 = yin-j+t
            let i1 = + x0 > y0
            let j1 = + !i1
            let x1 = x0 - i1 + G2
            let y1 = y0 - j1 + G2
            let x2 = x0 - 1 + 2 * G2
            let y2 = y0 - 1 + 2 * G2
            i &= 0xFF
            j &= 0xFF
            let gi0 = perlinGradients[i + permutations[j]],
                gi1 = perlinGradients[i + i1 + permutations[j + j1]],
                gi2 = perlinGradients[i + 1 + permutations[j + 1]]
            let t0 = 0.5 - x0 * x0 - y0 * y0
            let n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * (gi0[0] * x0 + gi0[1] * y0))
            let t1 = 0.5 - x1 * x1 - y1 * y1
            let n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * (gi1[0] * x1 + gi1[1] * y1))
            let t2 = 0.5 - x2 * x2 - y2 * y2
            let n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * (gi2[0] * x2 + gi2[1] * y2))
            return 70 * (n0 + n1 + n2)
        },
        simplex3: (xin, yin, zin) => {
            let s = (xin+yin+zin)*F3,
                i = Math.floor(xin+s),
                j = Math.floor(yin+s),
                k = Math.floor(zin+s),
                t = (i+j+k)*G3,
                x0 = xin-i+t,
                y0 = yin-j+t,
                z0 = zin-k+t
            let index = (((x >= y) << 2) + ((y >= z) << 1) + (x >= z)) % 6
            let [ i1, j1, k1, i2, j2, k2 ] = [
                [0, 0, 1, 0, 1, 1],
                [1, 0, 0, 1, 1, 0],
                [0, 1, 0, 0, 1, 1],
                [0, 1, 0, 1, 1, 0],
                [0, 0, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 1]
            ][index]
            
            let x1 = x0 - i1 + G3
            let y1 = y0 - j1 + G3
            let z1 = z0 - k1 + G3
            let x2 = x0 - i2 + 2 * G3
            let y2 = y0 - j2 + 2 * G3
            let z2 = z0 - k2 + 2 * G3
            let x3 = x0 - 1 + 3 * G3
            let y3 = y0 - 1 + 3 * G3
            let z3 = z0 - 1 + 3 * G3
            i &= 0xFF
            j &= 0xFF
            k &= 0xFF
            let gi0 = perlinGradients[i + permutations[j + permutations[k]]]
            let gi1 = perlinGradients[i + i1 + permutations[j + j1 + permutations[k + k1]]]
            let gi2 = perlinGradients[i + i2 + permutations[j + j2 + permutations[k + k2]]]
            let gi3 = perlinGradients[i + 1 + permutations[j + 1 + permutations[k + 1]]]
            let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0
            let n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * (gi0[0] * x0 + gi0[1] * y0 + gi0[2] * z0))
            let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1
            let n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * (gi1[0] * x1 + gi1[1] * y1 + gi1[2] * z1))
            let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2
            let n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * (gi2[0] * x2 + gi2[1] * y2 + gi2[2] * z2))
            let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3
            let n3 = t3 < 0 ? 0 : (t3 *= t3, t3 * t3 * (gi3[0] * x3 + gi3[1] * y3 + gi3[2] * z3))
            return 32 * (n0 + n1 + n2 + n3)
        },
        perlin2: (x, y) => {
            let X = Math.floor(x),
                Y = Math.floor(y)
            x = x - X
            y = y - Y
            X = X & 0xFF
            Y = Y & 0xFF
            let n00 = vec2.dot(perlinGradients[X + permutations[Y]], [x, y])
            let n01 = vec2.dot(perlinGradients[X + permutations[Y + 1]], [x, y-1])
            let n10 = vec2.dot(perlinGradients[X + 1 + permutations[Y]], [x-1, y])
            let n11 = vec2.dot(perlinGradients[X + 1 + permutations[Y + 1]], [x-1, y-1])
            let u = fade(x)
            return lerp(lerp(n00, n10, u),
                        lerp(n01, n11, u),
                        fade(y))
        },
        perlin3: (x, y, z) => {
            let X = Math.floor(x),
                Y = Math.floor(y),
                Z = Math.floor(z)
            x = x - X
            y = y - Y
            z = z - Z
            X = X & 0xFF
            Y = Y & 0xFF
            Z = Z & 0xFF
            let n000 = vec3.dot(perlinGradients[X + permutations[Y + permutations[Z]]], [x, y, z])
            let n001 = vec3.dot(perlinGradients[X + permutations[Y + permutations[Z + 1]]], [x, y, z-1])
            let n010 = vec3.dot(perlinGradients[X + permutations[Y + 1 + permutations[Z]]], [x, y-1, z])
            let n011 = vec3.dot(perlinGradients[X + permutations[Y + 1 + permutations[Z + 1]]], [x, y-1, z-1])
            let n100 = vec3.dot(perlinGradients[X + 1 + permutations[Y + permutations[Z]]], [x-1, y, z])
            let n101 = vec3.dot(perlinGradients[X + 1 + permutations[Y + permutations[Z + 1]]], [x-1, y, z-1])
            let n110 = vec3.dot(perlinGradients[X + 1 + permutations[Y + 1 + permutations[Z]]], [x-1, y-1, z])
            let n111 = vec3.dot(perlinGradients[X + 1 + permutations[Y + 1 + permutations[Z + 1]]], [x-1, y-1, z-1])
            let u = fade(x),
                v = fade(y),
                w = fade(z)
            return lerp(lerp(lerp(n000, n100, u), 
                             lerp(n001, n101, u), w), 
                        lerp(lerp(n010, n110, u), 
                             lerp(n011, n111, u), w), v)
        }
    }
}
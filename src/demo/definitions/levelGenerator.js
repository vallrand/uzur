import { vec2 } from '../../lib/math'
import { WeightTable, ease } from '../../lib/algorithms'

const definitions = {
    ['life']: { amount: [5, 4*15], size: [0.8, 1.2], interval: 0.5, offset: 2.5 },
    ['mind']: { amount: [5, 4*15], size: [0.8, 1.2], interval: 0.5, offset: 2.5 },
    ['crinite']: { amount: [8, 4*24], size: [0.75, 1.25], interval: 0.2, offset: 2.5 },
    ['fibrous']: { amount: [8, 4*24], size: [0.75, 1.25], interval: 0.2, offset: 2.5 },
    ['sulphur']: { amount: [8, 4*24], size: [0.75, 1.25], interval: 0.2, offset: 2.5 },
    ['tubular']: { amount: [8, 4*24], size: [0.75, 1.25], interval: 0.2, offset: 2.5 },
    ['shell']: { amount: [4, 8], size: [0.8, 1.8], interval: 0.8, offset: 4.2 },
    ['fungus']: { amount: [2, 6], size: [0.8, 1.8], interval: 0.8, offset: 4.2 },
    ['nucleus']: { amount: [1, 4], size: [1, 1], interval: 0.5, offset: 2.5 },
    ['squid']: { amount: [2, 6], size: [1.4, 2], interval: 1.2, offset: 3.2 },
    ['hive']: { amount: [1, 2], size: [1, 1], interval: 0.5, offset: 8.0 },
    ['rival']: { amount: [1, 1], size: [1, 1], interval: 0.5, offset: 4.0 },
    ['nerve']: { amount: [1, 2], size: [0.8, 1.2], interval: 1.2, offset: 4.0 },
    ['nest']: { amount: [1, 2], size: [0.75, 1], interval: 1.2, offset: 4.0 },
    ['plague']: { amount: [1, 2], size: [1, 1], interval: 1.2, offset: 4.0 },
    ['cancer']: { amount: [1, 1], size: [1, 1], interval: 0.5, offset: 0.0 }
}

export const generateLevel = ({
    waveCount = 1
}) => {
    const frames = []
    let timeOffset = 2
    
    Array.range(waveCount).forEach(idx => {
        frames.push({
            time: timeOffset,
            marker: `Wave Nr ${idx}`
        })
        
        const progress = idx / (waveCount - 1 || 1)
        const critters = WeightTable({
            ['life']: Math.lerp(10, 1, progress) | 0,
            ['mind']:  Math.lerp(10, 1, progress) | 0,
            ['crinite']: Math.lerp(20, 0, progress) | 0,
            ['fibrous']: Math.lerp(20, 0, progress) | 0,
            ['sulphur']: Math.lerp(20, 0, progress) | 0,
            ['tubular']: Math.lerp(20, 0, progress) | 0,
            ['shell']: ease.linearGradient([2, 10, 15, 4, 2])(progress) | 0,
            ['fungus']: ease.linearGradient([2, 10, 15, 4, 2])(progress) | 0,
            ['nucleus']: ease.linearGradient([2, 10, 15, 4, 2])(progress) | 0,
            ['squid']: ease.linearGradient([2, 10, 15, 4, 2])(progress) | 0,
            ['hive']: ease.linearGradient([0, 2, 5, 10])(progress) | 0,
            ['rival']: ease.linearGradient([0, 2, 5, 10])(progress) | 0,
            ['nerve']: ease.linearGradient([0, 0, 8, 8])(progress) | 0,
            ['nest']: ease.linearGradient([0, 0, 8, 8])(progress) | 0,
            ['plague']: ease.linearGradient([0, 0, 8, 8])(progress) | 0,
            ['cancer']: progress == 1 && waveCount >= 8 ? 50 : 0
        })
        
        const genus = critters.item(Math.randomInt(0, critters.length - 1))
        const {
            amount: amountRange,
            size: sizeRange,
            interval,
            offset
        } = definitions[genus]
        
        const amount = Math.randomInt(amountRange[0], amountRange[1])
        const duration = amount * interval
        Array.range(amount).forEach(i => {
            frames.push({
                time: timeOffset += duration / amount,
                genus: genus,
                properties: {
                    size: Math.randomFloat(sizeRange[0], sizeRange[1]),
                    y: Math.randomFloat(-0.9, 0.9),
                    ambient: Math.randomFloat(0, 0.2)
                }
            })
        })
        timeOffset += offset
    })
    return frames
}
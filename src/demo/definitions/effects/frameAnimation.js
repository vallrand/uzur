import { Timeline } from '../../../lib/algorithms'

const framesets = {
    ['explosion']: {
        frames: [
            'explosion_0.png','explosion_1.png','explosion_2.png','explosion_3.png',
            'explosion_4.png','explosion_5.png','explosion_6.png','explosion_7.png',
            'explosion_8.png','explosion_8.png','explosion_9.png','explosion_9.png',
            'explosion_10.png','explosion_10.png','explosion_11.png','explosion_11.png',
            'explosion_12.png','explosion_12.png','explosion_13.png','explosion_13.png',
            'explosion_14.png','explosion_14.png','explosion_15.png','explosion_15.png'
        ],
        framesPerSecond: 30
    },
    ['blood']: {
        frames: [
            'blood_explosion_1.png','blood_explosion_2.png','blood_explosion_3.png','blood_explosion_4.png',
            'blood_explosion_5.png','blood_explosion_6.png',
            'blood_explosion_7.png','blood_explosion_7.png','blood_explosion_8.png','blood_explosion_8.png',
            'blood_explosion_9.png','blood_explosion_9.png','blood_explosion_10.png','blood_explosion_10.png',
            'blood_explosion_11.png','blood_explosion_11.png','blood_explosion_12.png','blood_explosion_12.png'
        ],
        framesPerSecond: 30
    }
}

export const Animation = (facade, { frameset, end, ...properties }) => {
    const target = facade.create({
        type: 'bitmap',
        pivotX: 0.5, pivotY: 0.5,
        scaleX: 1.0, scaleY: 1.0,
        rotation: Math.randomFloat(-Math.PI, Math.PI),
        z: 8,
        ...properties
    })
    
    const { frames, ...options } = framesets[frameset]
    facade.procedure(Timeline(frames, options)(target, () => {
        target.delete()
        end && end()
    }))
}
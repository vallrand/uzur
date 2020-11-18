import { decodeBase64 } from './base64'

export const parseAudioData = ctx => resource => {
    if(resource.type !== 'audio') return false
    const array = decodeBase64(resource.data.base64)
    return new Promise(ctx.audio.decodeAudioData.bind(ctx.audio, array.buffer))
    .then(buffer => {
        const trimOffset = 576 / buffer.sampleRate
        resource.data = {
            type: 'sound',
            buffer,
            start: trimOffset,
            duration: buffer.duration - trimOffset
        }
    })
}
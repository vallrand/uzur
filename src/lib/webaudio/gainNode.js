import { AudioNode, AudioParameter } from './audioNode'

export const GainNode = AudioNode(ctx => {
    const gainNode = ctx.audio.createGain()
    ctx.reconnect(gainNode)
    
    ctx.registerEventHandler('volume', AudioParameter(ctx.audio, gainNode.gain))
    
    return {
        get volume(){ return gainNode.gain.value },
        set volume(value){ gainNode.gain.value = value }
    }
})
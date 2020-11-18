import { AudioNode, AudioParameter } from './audioNode'

export const StereoPannerNode = AudioNode(ctx => {
    const stereoPannerNode = ctx.audio.createStereoPanner()
    ctx.reconnect(stereoPannerNode)
    
    ctx.registerEventHandler('pan', AudioParameter(ctx.audio, stereoPannerNode.pan))
    
    return {
        get pan(){ return stereoPannerNode.pan.value },
        set pan(value){ stereoPannerNode.pan.value = value }
    }
})
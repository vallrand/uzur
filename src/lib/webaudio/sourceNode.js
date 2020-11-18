import { PromiseQueue } from '../util'
import { AudioNode, AudioParameter } from './audioNode'

export const SourceNode = AudioNode((ctx, { buffer, start, duration }) => {
    let startTime,
        playheadOffset = 0,
        rate = 1,
        loop = false,
        playing = false
    const endSignal = PromiseQueue()
    
    function refresh(){
        const sourceNode = ctx.audio.createBufferSource()
        sourceNode.buffer = buffer
        sourceNode.loop = loop
        sourceNode.loopStart = start
        sourceNode.loopEnd = start + duration
        sourceNode.playbackRate.value = rate
        ctx.reconnect(sourceNode)
    }
    
    ctx.registerEventHandler('rate', options => AudioParameter(ctx.audio, ctx.node.playbackRate)(options))
    ctx.registerEventHandler('stop', ({ time = 0 }) => {
        if(!playing) return
        ctx.node.stop(ctx.audio.currentTime + time)
    })
    ctx.registerEventHandler('play', ({ time = 0, offset }) => {
        if(playing) return
        refresh()
        ctx.node.onended = function(){
            playheadOffset = Math.mod(ctx.audio.currentTime - startTime, duration)
            playing = false
            endSignal.dispatch()
        }
        playing = true
        if(offset != null) playheadOffset = offset
        startTime = ctx.audio.currentTime - playheadOffset
        ctx.node.start(ctx.audio.currentTime + time, playheadOffset + start, loop ? undefined : duration)
        return endSignal.await()
    })
    
    return {
        get loop(){ return loop },
        set loop(value){ loop = value },
        get rate(){ return rate },
        set rate(value){ rate = value }
    }
})
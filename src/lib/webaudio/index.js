import { unlockAudio } from './unlockAudio'
import { visibility, Emitter } from '../util'

import { AudioNode } from './audioNode'
import { GainNode } from './gainNode'
import { SourceNode } from './sourceNode'
import { StereoPannerNode } from './stereoPannerNode'
import { PannerNode, SpatialListener } from './pannerNode'
import { DynamicsCompressorNode } from './dynamicsCompressorNode'

export default () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)
        
    return {
        audio: audioCtx,
        unlock: callback => unlockAudio(audioCtx).then(() => {
            audioCtx.addEventListener('statechange', event => {
                if(audioCtx.state === 'running') callback(true)
                else if(audioCtx.state === 'suspended') callback(false)
            })
            visibility.listen(focus => focus ? audioCtx.resume() : audioCtx.suspend())
            callback(true)
        }),
        GainNode: GainNode(audioCtx),
        SourceNode: SourceNode(audioCtx),
        StereoPannerNode: StereoPannerNode(audioCtx),
        PannerNode: PannerNode(audioCtx),
		DynamicsCompressorNode: DynamicsCompressorNode(audioCtx),
        spatial: SpatialListener(audioCtx),
        get root(){ return audioCtx.destination }
    }
}
import { combine } from '../../util'
import { vec3 } from '../../math'
const cleanupNodes = nodeStack => entity => nodeStack.forEach(node => node.clear())
const connectNodes = nodeStack => nodeStack.reduce((prev, next) => (next.output = prev.input, next))

export const soundFactory = (store, ctx) => ({
    track,
    loop,
    ...options
}) => {
    const nodeStack = []
    const source = ctx.SourceNode(store.requestSync(track).data)
    source.loop = loop
    
    const gain = ctx.GainNode()
    
    nodeStack.unshift(gain, source)
    
    const entity = {
        get track(){ return track },
        get volume(){ return gain.volume },
        set volume(value){ gain.volume = value },
        get rate(){ return source.rate },
        set rate(value){ source.rate = value },
        set output(value){ nodeStack[0].output = value },
        play({ fadeIn = 0 } = {}){
            if(fadeIn){
                gain.schedule('volume', { time: 0, value: 0, ease: 'none' })
                gain.schedule('volume', { time: fadeIn, value: entity.volume, ease: 'linear' })
            }
            return source.schedule('play').then(entity.delete.bind(entity))
        },
        stop({ fadeOut = 0 } = {}){
            if(fadeOut){
                gain.schedule('volume', { time: fadeOut, value: 0, ease: 'linear' })
            }
            source.schedule('stop', { time: fadeOut })
        }
    }
    
    if(options.position){
        const panner = ctx.PannerNode()
        nodeStack.unshift(panner)
        
        combine(entity, {
            get position(){ return panner.position },
            set position(value){
                panner.position = vec3(
                    0.2 * value[0] / entity.parent.root.delegate.width,
                    0.2 * value[1] / entity.parent.root.delegate.height,
                    -0.1
                )
                panner.orientation = vec3.normalize(vec3.subtract(vec3.ZERO, panner.position))
            }
        })
    }
    
    connectNodes(nodeStack)
    Object.assign(entity, options)
    entity.cleanupProcedures.push(cleanupNodes(nodeStack))
    return entity
}
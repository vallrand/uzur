import { combine } from '../util'

export const AudioParameter = (ctx, audioParam) => ({
    time = 0,
    ease = 'none',
    value = audioParam.defaultValue,
    overwrite = false
}) => {
    if(overwrite) audioParam.cancelScheduledValues(0)
    value = Math.clamp(value, audioParam.minValue, audioParam.maxValue)
    switch(ease){
        case 'none':
            audioParam.setValueAtTime(value, ctx.currentTime + time)
            break
        case 'linear':
            audioParam.linearRampToValueAtTime(value, ctx.currentTime + time)
            break
        case 'exponential':
            audioParam.exponentialRampToValueAtTime(value, ctx.currentTime + time)
            break
    }
}

export const AudioNode = provider => ctx => properties => {
    const eventHandlers = Object.create(null)
    const proxy = {
        audio: ctx,
        parentNode: null,
        node: null,
        reconnect: node => {
            if(proxy.node) proxy.node.disconnect()
            proxy.node = node
            if(proxy.node && proxy.parentNode) proxy.node.connect(proxy.parentNode)
        },
        registerEventHandler: (event, handler) => eventHandlers[event] = handler
    }
    
    const audioNode = provider(proxy, properties)
    
    return combine(audioNode, {
        get input(){ return proxy.node },
        set output(value){
            proxy.parentNode = value
            proxy.reconnect(proxy.node)
        },
        schedule: (event, options) =>
            eventHandlers[event] && eventHandlers[event].call(audioNode, options || {}),
        clear: () => {
            audioNode.schedule('stop')
            proxy.parentNode = null
            proxy.reconnect(null)
        }
    })
}
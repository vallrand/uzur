import { combine } from '../../util'
import { DelegateArray } from '../../algorithms'

const cleanupNodes = nodeStack => entity => nodeStack.forEach(node => node.clear())
const connectNodes = nodeStack => nodeStack.reduce((prev, next) => (next.output = prev.input, next))
const recursiveDelete = node => node.entities.forEach(entity => entity.delete())

export const channelFactory = (store, ctx) => ({
    ...options
}) => {
	const nodeStack = []
    const gain = ctx.GainNode()
	
	nodeStack.unshift(gain)
    
    const entity = {
        entities: DelegateArray([], node => node.output = nodeStack[nodeStack.length-1].input, 
                                    node => node.output = null),
        set output(value){ nodeStack[0].output = value },
        get volume(){ return gain.volume },
        set volume(value){ gain.volume = value },
        get root(){
            let node = entity
            while(node.parent) node = node.parent
            return node
        }
    }
	
	if(options.compressor){
		const compressor = ctx.DynamicsCompressorNode()
		nodeStack.unshift(compressor)
		
		combine(entity, {
            set compressor(value){ Object.assign(compressor, value) }
        })
	}
	console.log(nodeStack)
    connectNodes(nodeStack)
    Object.assign(entity, options)
    entity.cleanupProcedures.push(cleanupNodes(nodeStack))
    
    if(entity.root.delegate && entity.root.delegate.factory)
        entity.create = entity.root.delegate.factory(entity)
    entity.cleanupProcedures.push(recursiveDelete)
    return entity
}
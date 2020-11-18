import { AudioNode, AudioParameter } from './audioNode'

export const DynamicsCompressorNode = AudioNode(ctx => {
	const compressorNode = ctx.audio.createDynamicsCompressor()
	ctx.reconnect(compressorNode)
	
	ctx.registerEventHandler('threshold', AudioParameter(ctx.audio, compressorNode.threshold))
	ctx.registerEventHandler('knee', AudioParameter(ctx.audio, compressorNode.knee))
	ctx.registerEventHandler('ratio', AudioParameter(ctx.audio, compressorNode.ratio))
	ctx.registerEventHandler('attack', AudioParameter(ctx.audio, compressorNode.attack))
	ctx.registerEventHandler('release', AudioParameter(ctx.audio, compressorNode.release))
	
	return {
		get threshold(){ return compressorNode.threshold.value },
		set threshold(value){ compressorNode.threshold.value = value },
		get knee(){ return compressorNode.knee.value },
		set knee(value){ compressorNode.knee.value = value },
		get ratio(){ return compressorNode.ratio.value },
		set ratio(value){ compressorNode.ratio.value = value },
		get attack(){ return compressorNode.attack.value },
		set attack(value){ compressorNode.attack.value = value },
		get release(){ return compressorNode.release.value },
		set release(value){ compressorNode.release.value = value },
		get reduction(){ return compressorNode.reduction }
	}
})
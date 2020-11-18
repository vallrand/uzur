export const unlockAudio = ctx => new Promise(resolve => {
    if(ctx.state === 'running') return resolve()
    const interactionEvent = 'ontouchend' in window ? 'touchend' : 'click'
    function unlock(){
        document.removeEventListener(interactionEvent, unlock, true)
        
        ctx.resume().then(() => {
            const source = ctx.createBufferSource()
            source.buffer = ctx.createBuffer(1, 1, 0.5 * 44100)
            source.connect(ctx.destination)
            source.start(0)
            source.onended = () => {
                source.disconnect(0)
                resolve()
            }
        })
    }
    document.addEventListener(interactionEvent, unlock, true)
})
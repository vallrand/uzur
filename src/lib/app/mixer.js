import { combine } from '../util'

const MessageOverlay = text => {
    const container = document.createElement('div')
    const label = document.createElement('div')
    label.innerText = text
    Object.assign(label.style, {
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    })
    
    container.appendChild(label)
    Object.assign(container.style, {
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#efefef',
        width: '100%',
        height: '100%',
        boxShadow: '#080a0c 0 0 100px 50px inset, #080a0c 0 0 100px 50px',
        zIndex: 2,
        pointerEvents: 'all'
    })
    return container
}

export default audioCtx => stage => {
    const mixer = stage.factory(null)({
        type: 'channel',
        delegate: stage,
        output: audioCtx.root
    })
    console.log(stage)
    const overlay = MessageOverlay('RESUME')
    stage.overlay.appendChild(overlay)
    
    audioCtx.unlock(state => {
        stage.updateProcedures.enabled = state
        overlay.style.display = state ? 'none' : 'block'
    })
    
    return combine(stage, {
        mixer
    })
}
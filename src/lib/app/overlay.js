import { resize, combine } from '../util'

export default canvas => stage => {
    const overlay = document.createElement('div')
    document.body.appendChild(overlay)
    Object.assign(overlay.style, {
        position: 'fixed',
        left: 0, right: 0,
        margin: 'auto',
        zIndex: 1,
        pointerEvents: 'all'
    })
    
    resize.listen(event => Object.assign(overlay.style, {
        width: canvas.style.width,
        height: canvas.style.height
    }))
    window.dispatchEvent(new Event('resize'))
    
    document.querySelector('.spinner').style.display = 'none'
    
    return combine(stage, {
        overlay
    })
}
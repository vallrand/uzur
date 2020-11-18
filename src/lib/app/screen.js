import { combine, resize } from '../util'
import { vec3, vec4 } from '../math'

export default ctx => initialize => {
    const width = 800,
          height = 600

    ctx.resize(width, height)
    resize.listen(([ screenWidth, screenHeight ]) => {
        const aspectRatio = width / height
        ctx.canvas.style.width = Math.min(width, 0.8 * screenWidth, 0.8 * screenHeight * aspectRatio) + 'px'
        ctx.canvas.style.height = Math.min(height, 0.8 * screenHeight, 0.8 * screenWidth / aspectRatio) + 'px'
    })
    
    return initialize({
        type: 'layer',
        frame: {
            width, height,
            renderTarget: ctx.renderTarget,
            backgroundColor: vec4(0, 0, 0, 1)
        }
    })
}
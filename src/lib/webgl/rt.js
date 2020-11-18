import { mat3, mat3x2, color, vec4 } from '../math'
import FrameBufferObject from './fbo'

const RenderTarget = (gl, state) => ({
    framebuffer = false,
    backgroundColor = null
} = {}) => {
    const srcFrame = vec4(0, 0, 0, 0),
          projectionMatrix = mat3.identity()
    let fbo = framebuffer === true ? FrameBufferObject(gl, state)() : framebuffer
    
    const target = {
        get backgroundColor(){ return backgroundColor },
        set backgroundColor(value){
            backgroundColor = value && vec4.copy(value, backgroundColor || vec4(0, 0, 0, 1))
        },
        get projectionMatrix(){ return projectionMatrix },
        get width(){ return srcFrame[2] - srcFrame[0] },
        get height(){ return srcFrame[3] - srcFrame[1] },
        get texture(){ return fbo && fbo.texture },
        resize: (width, height, offsetX = 0, offsetY = 0) => {
            srcFrame[0] = offsetX
            srcFrame[1] = offsetY
            srcFrame[2] = width
            srcFrame[3] = height
            mat3.projection(width, fbo ? height : -height, offsetX, offsetY, projectionMatrix)
            if(fbo) fbo.init(target.width, target.height)
            return target
        },
        bind: _ => {
            if(fbo) fbo.bind()
            else if(state.set('fbo', null)) gl.bindFramebuffer(gl.FRAMEBUFFER, null)

            if(state.set('viewport', srcFrame.toString()))
                gl.viewport(srcFrame[0], srcFrame[1], srcFrame[2], srcFrame[3])

            return target
        },
        clear: _ => {
            if(backgroundColor){
                gl.clearColor(...backgroundColor)
                gl.clear(gl.COLOR_BUFFER_BIT)
            }
            return target
        },
        swapFramebuffer: framebuffer => {
            let prevFramebuffer = fbo
            fbo = framebuffer
            return prevFramebuffer
        }
    }
    return target
}

export default RenderTarget
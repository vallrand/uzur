import Texture from './texture'

const FrameBufferObject = (gl, state) => () => {
    const framebuffer = gl.createFramebuffer()
    let texture = null
    
    const target = {
        get texture(){ return texture },
        get binding(){ return framebuffer },
        bind: _ => {
            if(state.set('fbo', framebuffer))
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
            return target
        },
        unbind: _ => {
            if(state.set('fbo', null))
                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            return target
        },
        init: (width, height) => {
            if(framebuffer.width == width && framebuffer.height == height) return target
            target.bind()
            framebuffer.width = width
            framebuffer.height = height
            texture = texture || Texture(gl, state)()
            texture.uploadData(null, width, height)
                .setWrap(false)
                .setFiltering(true, true, false)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.binding, 0)
            return target
        },
        swapTexture: value => {
            const ejected = texture
            texture = value
            framebuffer.width = framebuffer.height = 0
            return ejected
        },
        delete: _ => {
            gl.deleteFramebuffer(framebuffer)
            texture && texture.delete()
        }
    }
    
    return target
}

export default FrameBufferObject
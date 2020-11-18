export * from './dissolve'
export * from './dissipate'
export * from './threshold'
export * from './glare'
export * from './color'
export * from './chromaticAbberation'
export * from './shockwave'

import { vec2, mat3 } from '../../../math'

const FramebufferPool = ctx => {
    const framebuffers = Object.create(null)
    
    return {
        obtain: (width, height) => {
            const key = `${width}-${height}`
            framebuffers[key] = framebuffers[key] || []
            return framebuffers[key].pop() || ctx.FBO().init(width, height)
        },
        release: fbo => {
            if(!fbo) return false
            const key = `${fbo.binding.width}-${fbo.binding.height}`
            return (framebuffers[key] = framebuffers[key] || []).push(fbo)
        },
        clear: _ => Object.values(framebuffers => framebuffers.forEach(fbo => fbo.delete()))
    }
}

export default (ctx, vao) => {
    const gl = ctx.gl,
          framebufferPool = FramebufferPool(ctx),
          invResolution = vec2(0, 0),
          projectionMatrix = mat3.identity()
    
    return function apply(shader, renderTarget, options){
        const { width, height } = renderTarget
        invResolution[0] = 1 / width
        invResolution[1] = 1 / height
        
        const fbo = framebufferPool.obtain(width, height).bind()
        
        if(ctx.state.set('viewport', `0,0,${width},${height}`))
            gl.viewport(0, 0, width, height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        renderTarget.texture.bind(0)
        ctx.blend.mode = false
        
        shader.uao['invResolution'] = invResolution
        shader.uao['projectionMatrix'] = projectionMatrix
        shader.synchronize(options)        
        shader.use()
        
        vao.bind()
        vao.render(gl.TRIANGLE_FAN, 4, 0)
        
        framebufferPool.release(renderTarget.swapFramebuffer(fbo))
    }
}
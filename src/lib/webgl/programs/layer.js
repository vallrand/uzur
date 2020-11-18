import { mat3, mat3x2, vec2, vec4, vec3 } from '../../math'
import FilterManager from './filters'

const layerShader = {
    vert: `
attribute vec2 position;
uniform mat3 projectionMatrix;
varying vec2 uvPass;

void main(){
    uvPass = 0.5 + 0.5 * position;
    gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}`,
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;

void main(){
    gl_FragColor = texture2D(sampler, uvPass);
}`
}

export default filterLibrary => ctx => {
    const gl = ctx.gl
    const shader = ctx.Shader(layerShader.vert, layerShader.frag)
    const vbo = ctx.Buffer([-1,1,-1,-1,1,-1,1,1], false, false)
    const vao = ctx.VAO()
    .addAttribute(vbo, shader.attributes['position'], gl.FLOAT, false, 0, 0)
    .bind(true)
    shader.uao['sampler'] = 0
    
    const applyFilter = FilterManager(ctx, vao)
    Object.keys(filterLibrary).forEach(filter => {
        const shaderSource = filterLibrary[filter]
        const filterShader = ctx.Shader(shaderSource.vert || layerShader.vert, shaderSource.frag)
        filterShader.uao['sampler'] = 0
        filterLibrary[filter] = filterShader
    })
    
    function cleanup(entity){
        entity = entity.delegate || entity
        const fbo = entity.renderTarget.swapFramebuffer(null)
        fbo && fbo.delete()
    }
    
    const preRenderLayer = layer => {
        let { entities, renderTarget, filters } = layer
        
        if(!renderTarget){
            renderTarget = layer.renderTarget = ctx.RenderTarget({ framebuffer: true })
            layer.cleanupProcedures.push(cleanup)
        }
        
        renderTarget.backgroundColor = layer.backgroundColor
        if(!layer.depth) return ctx.render(entities)
        
        if(layer.backgroundColor && !entities.length) return
        renderTarget.resize(layer.width, layer.height, -layer.offsetX, -layer.offsetY)
        ctx.render(entities, renderTarget)
        
        filters.forEach(filter => applyFilter(filterLibrary[filter.type], renderTarget, filter))
    }
    
    const render = layer => {
        const { delegate: { renderTarget }, globalTransform } = layer
        
        if(!renderTarget.texture) return
        renderTarget.texture.bind(0)
        
        ctx.blend.mode = 'blend'
        
        const modelMatrix = mat3.fromMat3x2(globalTransform) //TODO precalculate
        shader.uao['projectionMatrix'] = mat3.multiply(ctx.renderTarget.projectionMatrix, modelMatrix)
        shader.use()
        
        
        vao.bind()
        vao.render(gl.TRIANGLE_FAN, 4, 0)
    }
    
    return {
        render: layer => (layer.delegate ? render : preRenderLayer)(layer),
        flush: () => null
    }
}
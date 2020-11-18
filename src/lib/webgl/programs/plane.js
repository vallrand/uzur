import { mat3, vec4, vec3 } from '../../math'

const defaultShader = {
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

void main(){
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`
}

export default ctx => {
    const gl = ctx.gl
    const vbo = ctx.Buffer([-1,1,-1,-1,1,-1,1,1], false, false)
    const vao = ctx.VAO()
    .addAttribute(vbo, { location: 0, size: 2 }, gl.FLOAT, false, 0, 0)
    .bind(true)
    
    const compileEffect = entity => {
        const shader = ctx.Shader(defaultShader.vert, entity.shader)
        return {
            shader,
            delete: shader.delete.bind(shader),
            synchronize: shader.synchronize.bind(shader, entity)
        }
    }
    
    const render = entity => {
        if(!entity.vfxData)
            entity.vfxData = compileEffect(entity)
        const { vfxData: { shader, synchronize }, blend = 'blend' } = entity
        
        const modelMatrix = mat3.fromMat3x2(entity.transformData)
        shader.uao['projectionMatrix'] = mat3.multiply(ctx.renderTarget.projectionMatrix, modelMatrix)
        
        synchronize()
        
        shader.use()
        
        ctx.blend.mode = blend
        
        vao.bind()
        vao.render(gl.TRIANGLE_FAN, 4, 0)
    }
    const flush = () => null
    return { render, flush }
}









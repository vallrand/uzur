import { mat3, vec4, vec3 } from '../../math'

const curveShader = {
    vert: `
attribute vec4 vertex;
attribute vec2 normal;

varying vec2 uvPass;

uniform mat3 projectionMatrix;

uniform float lineWidth;
uniform float timeOffset;

float envelope(float distance){
    return lineWidth * max(0.0, 0.5 - abs(distance - timeOffset));
}

void main(){
    vec2 position = vertex.xy;
    float width = envelope(vertex.z);
    position += normal * width;
    uvPass = vec2(0.5 + vertex.z - timeOffset, step(0.0, vertex.w));
    gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}`,
    frag: `
varying vec2 uvPass;

uniform sampler2D sampler;
uniform vec4 color;

void main(){
    gl_FragColor = color * texture2D(sampler, uvPass);
}`
}

export default ctx => {
    const gl = ctx.gl
    const shader = ctx.Shader(curveShader.vert, curveShader.frag)
    const MAX_VERTICES = 512,
          vertexArray = new Float32Array(12 * MAX_VERTICES)
    const vbo = ctx.Buffer(vertexArray.buffer, false, true)
    const vao = ctx.VAO()
    .addAttribute(vbo, shader.attributes['vertex'], gl.FLOAT, false, 4 * 6, 0)
    .addAttribute(vbo, shader.attributes['normal'], gl.FLOAT, false, 4 * 6, 4 * 4)
    .bind(true)
    shader.uao['sampler'] = 0
    
    const render = curve => {
        const {
            vertices, normals, lineWidth,
            timeOffset, rgba, textureData,
            blend
        } = curve,
              length = vertices.length
        for(let i = 0; i < length; i++){
            let index = i * 12,
                vertex = vertices[i],
                normal = normals[i]
            
            vertexArray[index + 0] = vertexArray[index + 6] = vertex[0]
            vertexArray[index + 1] = vertexArray[index + 7] = vertex[1]
            vertexArray[index + 2] = vertexArray[index + 8] = vertex[2]
            vertexArray[index + 3] = -(vertexArray[index + 9] = vertex[3])
            
            vertexArray[index + 10] = -(vertexArray[index + 4] = normal[0])
            vertexArray[index + 11] = -(vertexArray[index + 5] = normal[1])
        }
        vbo.upload(12 * length, 0)
        
        shader.uao.projectionMatrix = ctx.renderTarget.projectionMatrix
        shader.uao.lineWidth = lineWidth
        shader.uao.timeOffset = timeOffset
        shader.uao.color = rgba
        shader.use()
        
        ctx.blend.mode = blend || 'blend'
        
        textureData ? textureData.texture.bind(0) : ctx.defaultTexture.bind(0)
        
        vao.bind()
        vao.render(gl.TRIANGLE_STRIP, 2 * length, 0)
    }
    const flush = () => null
    return { render, flush }
}
import { mat3, vec4, vec3 } from '../../math'

const sphereShader = {
    vert: `
attribute vec2 position;
uniform mat3 projectionMatrix;
varying vec2 uvPass;

void main(){
    uvPass = position;
    gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}`,
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;

const float PI = ${Math.PI};
const float HALFPI = ${0.5*Math.PI};
const float TWOPI = ${2*Math.PI};

uniform mat4 rotation;
uniform vec3 lightPosition;

void main(){
    float d = uvPass.x * uvPass.x + uvPass.y * uvPass.y;
    float multiplier = 1.0 - step(1.0, d);
    float z = sqrt(1.0 - d);
    vec4 point = vec4(uvPass.xy, z, 1.0);
    vec4 lightPos = vec4(lightPosition, 1.0);
    float l = clamp(dot(point, lightPos), 0.2, 1.0);
    point *= rotation;
    float x = (atan(point.x, point.z) + PI) / TWOPI;
    float y = (asin(point.y) + HALFPI) / PI;
    vec4 texel = texture2D(sampler, vec2(x, y)) * vec4(l, l, l, 1.0);
    gl_FragColor = multiplier * texel * (1.0 - smoothstep(0.985, 1.0, d));
}`
}

export default ctx => {
    const gl = ctx.gl
    const shader = ctx.Shader(sphereShader.vert, sphereShader.frag)
    const vbo = ctx.Buffer([
        -1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0
    ], false, false)
    const vao = ctx.VAO()
    .addAttribute(vbo, shader.attributes['position'], gl.FLOAT, false, 0, 0)
    .bind(true)
    
    shader.uao.sampler = 0
    
    const render = sphere => {
        const { textureData, transformData, orientation, light } = sphere
        
        textureData.texture.bind(0)
        
        const modelMatrix = mat3.fromMat3x2(transformData)
        shader.uao['projectionMatrix'] = mat3.multiply(ctx.renderTarget.projectionMatrix, modelMatrix)
        
        shader.uao['lightPosition'] = light.position
        shader.uao['rotation'] = orientation
        
        shader.use()

        vao.bind()
        vao.render(gl.TRIANGLE_FAN, 4, 0)
    }
    const flush = () => null
    return { render, flush }
}
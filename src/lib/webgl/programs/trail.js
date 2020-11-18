import { mat3, vec4, vec3 } from '../../math'

const trailShader = {
    vert: `
attribute vec2 vertex;
attribute vec4 velocityAcceleration;
attribute vec3 offsetWidth;

uniform mat3 projectionMatrix;

uniform float time;
uniform float duration;
uniform float trailLength;
uniform float lifetime;

varying vec2 uvPass;
varying float fadePass;

void main(){
    vec2 velocity = velocityAcceleration.xy;
    vec2 acceleration = velocityAcceleration.zw;
    float trailOffset = offsetWidth.x;
    float timeOffset = offsetWidth.y;
    float trailWidth = offsetWidth.z;

    float timeElapsed = mod(time + duration - timeOffset, duration);
    timeElapsed = clamp(timeElapsed, 0.0, lifetime);

    float localTime = max(0.0, timeElapsed - trailOffset * trailLength);

    vec2 position = vertex + localTime * velocity + 0.5 * localTime * localTime * acceleration;
    vec2 direction = normalize(velocity + localTime * acceleration);
    vec2 normal = mix(trailWidth, 0.0, trailOffset) * vec2(direction.y, -direction.x);
    position += normal;

    uvPass = vec2(trailOffset, 0.5 + 0.5 * sign(trailWidth));
    fadePass = (lifetime - timeElapsed) / lifetime;

    gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}`,
    frag: `
varying vec2 uvPass;
varying float fadePass;

uniform sampler2D gradient;

void main(){
    float edge = step(length(2.0 * uvPass - 1.0), 1.0);
    vec4 color = edge * texture2D(gradient, vec2(uvPass.x, fadePass));
    gl_FragColor = color;
}`
}

const GradientTexture = (ctx, colorMatrix) => ctx.Texture()
        .uploadData(new Uint8Array(colorMatrix.reverse().flatten().map(rgba => [
            rgba[0] * 255 | 0,
            rgba[1] * 255 | 0,
            rgba[2] * 255 | 0,
            rgba[3] * 255 | 0
        ]).flatten()), colorMatrix[0].length, colorMatrix.length)
        .setFiltering(true, true, false)
        .setWrap(false)

export default ctx => {
    const gl = ctx.gl
    const shader = ctx.Shader(trailShader.vert, trailShader.frag)
    shader.uao['gradient'] = 0
        
    const initializeSystem = system => {
        const { indices, vertices } = system.computeVertices()
        const vbo = ctx.Buffer(vertices, indices, false)
        const vao = ctx.VAO()
        .addIndex(vbo)
        .addAttribute(vbo, shader.attributes['vertex'], gl.FLOAT, false, 4 * 9, 0)
        .addAttribute(vbo, shader.attributes['velocityAcceleration'], gl.FLOAT, false, 4 * 9, 4 * 2)
        .addAttribute(vbo, shader.attributes['offsetWidth'], gl.FLOAT, false, 4 * 9, 4 * 6)
        .bind(true)
        const clearData = () => {
            vbo.delete()
            vao.delete()
        }
        return { vbo, vao, indexCount: indices.length, delete: clearData }
    }
    
    const render = system => {
        if(!system.vertexData)
            system.vertexData = initializeSystem(system)
        if(!system.textureData && system.gradient)
            system.textureData = GradientTexture(ctx, system.gradient)
        
        const { vertexData: { vao, indexCount }, textureData: texture = ctx.defaultTexture } = system
        
        const modelMatrix = mat3.fromMat3x2(system.transformData)
        shader.uao['projectionMatrix'] = mat3.multiply(ctx.renderTarget.projectionMatrix, modelMatrix)
        shader.uao['time'] = system.time
        shader.uao['duration'] = system.duration
        shader.uao['lifetime'] = system.lifetime || system.duration
        shader.uao['trailLength'] = system.trailLength
        shader.use()
        
        texture.bind(0)
        
        ctx.blend.mode = 'blend'
        
        vao.bind()
        vao.render(gl.TRIANGLES, indexCount)
    }
    const flush = () => null
    return { render, flush }
}
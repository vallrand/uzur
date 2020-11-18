import { vec3 } from '../../math'

const batchShader = {
    vert: `
attribute vec2 position;
attribute vec2 uv;
attribute vec4 color;
attribute vec4 material;

uniform mat3 projectionMatrix;

varying vec2 uvPass;
varying vec4 colorPass;
varying vec4 materialPass;

void main(void){
    gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

    uvPass = uv;
    materialPass = vec4(material.xyz / 255.0, material.w);
    colorPass = color;
}`,
    frag: samplerCount => `
varying vec2 uvPass;
varying vec4 colorPass;
varying vec4 materialPass;
uniform sampler2D samplers[${samplerCount}];
uniform vec3 ambient;

void main(void){
    int textureId = int(materialPass.w+0.5);
    vec4 color;
    ${Array.range(samplerCount)
        .map(i => `if(textureId == ${i}) color = texture2D(samplers[${i}], uvPass);`)
        .join('\n')}
    color *= colorPass;
    gl_FragColor = vec4(mix(color.rgb, ambient, materialPass.x), color.a);
}`
}

export default ctx => {
    const gl = ctx.gl,
          MAX_TEXTURES = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
          BATCH_SIZE = 4096,
          stride = 5 * 4,
          vertexBuffer = new ArrayBuffer(stride * 4 * BATCH_SIZE),
          float32View = new Float32Array(vertexBuffer),
          uint32View = new Uint32Array(vertexBuffer)
    const vbo = ctx.Buffer(vertexBuffer, Array.range(BATCH_SIZE)
                           .map(idx => idx * 4)
                           .map(idx => [0,1,2,0,2,3].map(i => i + idx))
                           .flatten(), true)
    const shader = ctx.Shader(batchShader.vert, batchShader.frag(MAX_TEXTURES))
    const vao = ctx.VAO()
    .addIndex(vbo)
    .addAttribute(vbo, shader.attributes['position'], gl.FLOAT, false, stride, 0)
    .addAttribute(vbo, shader.attributes['uv'], gl.UNSIGNED_SHORT, true, stride, 2 * 4)
    .addAttribute(vbo, shader.attributes['color'], gl.UNSIGNED_BYTE, true, stride, 3 * 4)
    .addAttribute(vbo, shader.attributes['material'], gl.UNSIGNED_BYTE, false, stride, 4 * 4)
    .bind(true)
    
    const textures = []
    let index = 0,
        count = 0
    
    shader.uao.samplers = Array.range(MAX_TEXTURES)
    
    ctx.defaultTexture = ctx.Texture()
        .uploadData(new Uint8Array([255, 255, 255, 255]), 1, 1)
        .setFiltering(false, false, false)
        .setWrap(false)
        
    const render = bitmap => {
        if(!bitmap.alpha) return false
        const { vertexData, rgba, material, textureData: { uvs: uvData, texture }, blend = 'blend' } = bitmap
        let textureIdx = textures.indexOf(texture)
        
        if(
            (count + 1 >= BATCH_SIZE) ||
            (count && ctx.blend.mode !== blend) ||
            (textureIdx == -1 && textures.length >= MAX_TEXTURES)
        ) textureIdx = (flush(), -1)
        
        if(textureIdx == -1) textureIdx = textures.push(texture) - 1
        ctx.blend.mode = blend

        float32View[index + 0] = vertexData[0]
        float32View[index + 1] = vertexData[1]
        float32View[index + 5] = vertexData[2]
        float32View[index + 6] = vertexData[3]
        float32View[index + 10] = vertexData[4]
        float32View[index + 11] = vertexData[5]
        float32View[index + 15] = vertexData[6]
        float32View[index + 16] = vertexData[7]
        uint32View[index + 2] = uvData[0]
        uint32View[index + 7] = uvData[1]
        uint32View[index + 12] = uvData[2]
        uint32View[index + 17] = uvData[3]
        uint32View[index + 3] = uint32View[index + 8] = uint32View[index + 13] = uint32View[index + 18] = rgba
        uint32View[index + 4] = uint32View[index + 9] = uint32View[index + 14] = uint32View[index + 19] = material + (textureIdx << 24)
        
        index += 20
        count++
    }
    const flush = _ => {
        vbo.upload(index)
        
        Array.range(MAX_TEXTURES).forEach(i => (textures[i] || ctx.defaultTexture).bind(i))

        shader.uao['projectionMatrix'] = ctx.renderTarget.projectionMatrix
        shader.uao['ambient'] = vec3.copy(ctx.rootRenderTarget.backgroundColor || vec3.ZERO)
        shader.use()
        
        vao.bind()
        vao.render(gl.TRIANGLES, count * 6)
        
        index = count = 0
        textures.length = 0
    }
    return { render, flush }
}
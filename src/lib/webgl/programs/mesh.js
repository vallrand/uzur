import { mat3 } from '../../math'

const meshShader = {
    vert: `
attribute vec2 position;
attribute vec2 uv;

uniform mat3 projectionMatrix;

varying vec2 uvPass;

void main(void){
    gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
    uvPass = uv;
}`,
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec4 colorMask;

void main(){
    gl_FragColor = colorMask * texture2D(sampler, uvPass);
}`
}

export default ctx => {
    const gl = ctx.gl,
          MAX_INDICES = 8192,
          MAX_VERTICES = 4096
    const shader = ctx.Shader(meshShader.vert, meshShader.frag)
    const staticVBO = ctx.Buffer(MAX_VERTICES, MAX_INDICES, false),
          dynamicVBO = ctx.Buffer(MAX_VERTICES, null, true)
    const vao = ctx.VAO()
    .addIndex(staticVBO)
    .addAttribute(dynamicVBO, shader.attributes['position'], gl.FLOAT, false, 0, 0)
    .addAttribute(staticVBO, shader.attributes['uv'], gl.FLOAT, true, 0, 0)
    .bind(true)
    const uploadedData = [],
          bufferRange = []
    let indexOffset = 0,
        vertexOffset = 0
    shader.uao['sampler'] = 0
    
    function cleanup(mesh){
        let idx = uploadedData.indexOf(mesh)
        if(idx == -1) return
        indexOffset = bufferRange[idx][1]
        vertexOffset = bufferRange[idx][3]
        uploadedData.length = bufferRange.length = idx
    }
    
    const render = mesh => {
        let idx = uploadedData.indexOf(mesh)
        if(idx == -1){
            idx = uploadedData.push(mesh) - 1
            let { indexArray, vertexArray, uvs } = mesh

            bufferRange.push([indexArray.length, indexOffset, vertexArray.length, vertexOffset])
            staticVBO.uploadIndices(indexArray.length, indexOffset, new Uint16Array(indexArray.map(index => index + 0.5 * vertexOffset)))
            staticVBO.upload(uvs.length, vertexOffset, uvs)

            indexOffset += indexArray.length
            vertexOffset += vertexArray.length
            
            mesh.cleanupProcedures.push(cleanup)
        }
        
        let [ length, offset, dataLength, dataOffset ] = bufferRange[idx]
        dynamicVBO.upload(dataLength, dataOffset, mesh.vertexArray)
        
        mesh.textureData.texture.bind(0)
        
        const modelMatrix = mat3.fromMat3x2(mesh.transformData)
        shader.uao['projectionMatrix'] = mat3.multiply(ctx.renderTarget.projectionMatrix, modelMatrix)
        shader.uao['colorMask'] = mesh.colorMask
        
        shader.use()

        ctx.blend.mode = 'blend'
        
        vao.bind()
        vao.render(gl.TRIANGLES, length, offset)
    }
    const flush = _ => null
    return { render, flush }
}
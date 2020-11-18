import { mat3x2, vec2, vec3, vec4 } from '../../math'

export const meshFactory = store => options => {
    const position = vec3(0)
    const scale = vec2(1)
    const colorMask = vec4(1, 1, 1, 1)
    let texture = null
    
    let vertexArray = null,
        indexArray = null,
        uvs = null
    
    const entity = {
        get z(){ return position[2] },
        set z(value){
            if(position[2] === value) return
            position[2] = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        get textureData(){ return texture && texture.data },
        get transformData(){
            return mat3x2.fromTransform(position[0], position[1], 0, 0, scale[0], scale[1], 0)
        },
        get colorMask(){ return colorMask },
        set colorMask(value){ vec4.copy(value, colorMask) },
        get coordinates(){ return position },
        get texture(){
            return texture && texture.name
        },
        set texture(value){
            texture = store.requestSync(value)
        },
        get vertexArray(){
            return vertexArray
        },
        get uvs(){
            return uvs
        },
        get indexArray(){
            return indexArray
        },
        set data({
            scale = [1, 1],
            offset = [0, 0],
            vertices, indices
        }){
            const size = vec2(scale[0] * texture.data.width, scale[1] * texture.data.height)
            offset[0] -= 0.5 * size[0]
            offset[1] -= 0.5 * size[1]
            vertexArray = vertices
            indexArray = new Uint16Array(indices)
            uvs = new Float32Array(vertices.map((value, i) => (value - offset[i%2]) / size[i%2]))
        },
        get scaleX(){ return scale[0] },
        get scaleY(){ return scale[1] },
        set scaleX(value){
            scale[0] = value
        },
        set scaleY(value){
            scale[1] = value
        }
    }
    return Object.assign(entity, options)
}
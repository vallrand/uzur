import { mat4, mat3x2, vec2, vec3 } from '../../math'

export const sphereFactory = store => options => {
    const position = vec3(0),
          size = vec2(1),
          rotation = vec3(0, 0, 0),
          light = {
              position: vec3(0, 0, 0)
          }
    let texture = null
    
    const entity = {
        get z(){ return position[2] },
        set z(value){
            if(position[2] === value) return
            position[2] = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        get textureData(){ return texture && texture.data },
        get transformData(){
            return mat3x2.fromTransform(position[0], position[1], 0, 0, 0.5 * size[0], 0.5 * size[1], 0)
        },
        get texture(){
            return texture && texture.name
        },
        set texture(value){
            texture = store.requestSync(value)
        },
        get orientation(){
            const rotationX = mat4.fromEuler(rotation[0], 0.0, 0.0)
            const rotationY = mat4.fromEuler(0.0, rotation[1], 0.0)
            const rotationZ = mat4.fromEuler(0.0, 0.0, rotation[2])
            return mat4.multiply(mat4.multiply(rotationX, rotationY), rotationZ)
        },
        get rotation(){ return rotation },
        get light(){ return light },
        set light({ position }){
            vec3.copy(position, light.position)
        },
        get x(){ return position[0] },
        get y(){ return position[1] },
        set x(value){
            position[0] = value
        },
        set y(value){
            position[1] = value
        },
        get coordinates(){ return position },
        get width(){ return size[0] },
        get height(){ return size[1] },
        set width(value){
            size[0] = value
        },
        set height(value){
            size[1] = value
        }
    }
    return Object.assign(entity, options)
}
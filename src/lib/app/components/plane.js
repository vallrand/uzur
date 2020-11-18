import { mat3x2, vec2, vec3 } from '../../math'

export const planeFactory = store => options => {
    const position = vec3(0),
          size = vec2(1)
    let texture = null,
        shaderSource = null,
        time = 0
    
    const entity = {
        get z(){ return position[2] },
        set z(value){
            if(position[2] === value) return
            position[2] = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        get time(){ return time },
        set time(value){ time = value },
        get shader(){ return shaderSource },
        set shader(value){
            shaderSource = value
            if(entity.vfxData){
                entity.vfxData.delete()
                delete entity.vfxData
            }
        },
        get textureData(){ return texture && texture.data },
        get transformData(){
            return mat3x2.fromTransform(position[0], position[1], 0, 0, 0.5 * size[0], 0.5 * size[1], 0)
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
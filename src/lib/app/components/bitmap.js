import { mat3x2, vec2, vec3, normalizeAngle } from '../../math'

const computeVertexData = (texture, worldTransform, pivotX, pivotY, out) => {
    const [ a, b, c, d, tx, ty ] = worldTransform,
          left = texture.offsetX - pivotX * texture.size[0],
          right = left + texture.width,
          top = texture.offsetY - pivotY * texture.size[1],
          bottom = top + texture.height
    
    out[0] = a * left + c * top + tx
    out[1] = d * top + b * left + ty
    out[2] = a * right + c * top + tx
    out[3] = d * top + b * right + ty
    out[4] = a * right + c * bottom + tx
    out[5] = d * bottom + b * right + ty
    out[6] = a * left  + c * bottom + tx
    out[7] = d * bottom + b * left + ty
    return out
}

export const bitmapFactory = store => options => {
    const vertexData = new Float32Array(8),
          globalTransform = mat3x2(),
          pivot = vec2(0),
          position = vec3(0),
          scale = vec2(1),
          material = vec3(0, 0, 0)
    let texture,
        rotation = 0,
        color = 0xFFFFFF,
        alpha = 1.0,
        dirtyFlag = true
    
    const entity = {
        get z(){ return position[2] },
        set z(value){
            if(position[2] === value) return
            position[2] = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        get rgba(){
            const rgb = (color >> 16) + (color & 0xFF00) + ((color & 0xFF) << 16)
            return rgb + (alpha * 0xFF << 24)
        },
        get material(){
            return  ((material[2] * 0xFF | 0) << 16) + 
                    ((material[1] * 0xFF | 0) << 8) + 
                    ((material[0] * 0xFF | 0))
        },
        get ambient(){ return material[0] },
        set ambient(value){ material[0] = value },
        get textureData(){ return texture && texture.data },
        get vertexData(){
            if(dirtyFlag){
                mat3x2.fromTransform(position[0], position[1], 0, 0,
                                     scale[0], scale[1],
                                     rotation, globalTransform)
                computeVertexData(entity.textureData, globalTransform, pivot[0], pivot[1], vertexData)
                dirtyFlag = false
            }
            return vertexData
        },
        get texture(){
            return texture && texture.name
        },
        set texture(value){
            texture = store.requestSync(value)
            dirtyFlag = true
        },
        get x(){ return position[0] },
        get y(){ return position[1] },
        set x(value){
            position[0] = value
            dirtyFlag = true
        },
        set y(value){
            position[1] = value
            dirtyFlag = true
        },
        get coordinates(){ return position },
        get scaleX(){ return scale[0] },
        get scaleY(){ return scale[1] },
        set scaleX(value){
            scale[0] = value
            dirtyFlag = true
        },
        set scaleY(value){
            scale[1] = value
            dirtyFlag = true
        },
        get rotation(){ return rotation },
        set rotation(value){
            rotation = normalizeAngle(value)
            dirtyFlag = true
        },
        get pivotX(){ return pivot[0] },
        get pivotY(){ return pivot[1] },
        set pivotX(value){
            pivot[0] = value
            dirtyFlag = true
        },
        set pivotY(value){
            pivot[1] = value
            dirtyFlag = true
        },
        get alpha(){ return alpha },
        get color(){ return color },
        set alpha(value){
            alpha = Math.clamp(value, 0, 1)
        },
        set color(value){
            color = value
        }
    }
    return Object.assign(entity, options)
}
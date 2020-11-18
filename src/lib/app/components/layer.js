import { mat3x2, vec2, vec3, vec4, normalizeAngle } from '../../math'
import { OrderedArray } from '../../algorithms'

const recursiveDelete = node => (node.delegate || node).entities.forEach(entity => entity.delete())
const detach = node => {
    node = node.delegate || node
    node.root && node.root.layers.remove(node)
}

export const layerFactory = store => ({
    frame: {
        width,
        height,
        offsetX = 0,
        offsetY = 0,
        ...delegateOptions
    },
    destination,
    ...options
}) => {
    const entities = OrderedArray([], (a, b) => a.z - b.z)
    const delegate = {
        filters: [],
        entities,
        backgroundColor: null,
        get width(){ return width },
        get height(){ return height },
        get offsetX(){ return offsetX },
        get offsetY(){ return offsetY },
        get depth(){
            let depth = 0,
                node = delegate
            while(node = node.parent) depth++
            return depth
        },
        get root(){
            let node = delegate
            while(node.parent) node = node.parent
            return node
        },
        aquire: component => {
            if(component.parent) component.parent.entities.remove(component)
            component.parent = delegate
            entities.insert(component)
        }
    }
    
    Object.assign(delegate, { ...options, ...delegateOptions })
    delegate.cleanupProcedures.unshift(recursiveDelete, detach)
    
    if(delegate.root.factory) delegate.create = delegate.root.factory(delegate)
    if(delegate.root.layers && (!delegate.depth || destination))
        delegate.root.layers.insert(delegate)
    
    if(!destination) return delegate
    
    const globalTransform = mat3x2(),
          position = vec3(0), //TODO not synced with offsetX, offsetY. Should it be?
          scale = vec2(1)
    let rotation = 0,
        dirtyFlag = true
    
    const entity = {
        delegate,
        get z(){ return position[2] },
        set z(value){
            if(position[2] === value) return
            position[2] = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        get globalTransform(){
            if(dirtyFlag){
                mat3x2.fromTransform(position[0], position[1],
                                     0, 0, 0.5 * scale[0] * width, 0.5 * scale[1] * height,
                                     rotation, globalTransform)
                dirtyFlag = false
            }
            return globalTransform
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
        }
    }
    delegate.delete = _ => entity.delete()    
    return Object.assign(entity, { ...options, ...destination })
}
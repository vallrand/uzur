import { VERTEX_ARRAY, INDEX_ARRAY } from './vbo'

const VertexArrayObject = (gl, state) => {    
    state.set = (set => (location, value) => {
        if(location === 'index' && state['vao'] && state.vao.indexBinding !== value && state.vao.indexBinding != null)
            state['vao'].unbind()
        return set(location, value)
    })(state.set)
    
    return () => {
        const MAX_ATTRIBUTES = gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
        const vaoExtension = state.extensions.vertex_array_object
        const vao = vaoExtension && vaoExtension.createVertexArrayOES()
        const attributes = [],
              boundAttributes = vaoExtension ? [] : (state.attributes = state.attributes || [])
        let indexBinding,
            indexBuffer = null

        const target = {
            get indexBinding(){ return indexBinding },
            addIndex: idxBuffer => (indexBuffer = idxBuffer, target),
            addAttribute: (buffer, attribute, type, normalized, stride, offset) => (
                attributes.push({
                    buffer,
                    attribute,
                    type: type || gl.FLOAT,
                    normalized: normalized || false,
                    stride: stride || 0,
                    offset: offset || 0
                }), target),
            bind: (init = false) => {
                if(vaoExtension && state.set('vao', target))
                    vaoExtension.bindVertexArrayOES(vao)
                state.set('index', indexBinding)
                if(vaoExtension && !init) return target
                if(indexBuffer) indexBinding = (indexBuffer.bind(INDEX_ARRAY), state['index'])
                
                attributes.forEach(attrib => {
                    const location = attrib.attribute.location
                    if(attrib.buffer) attrib.buffer.bind(VERTEX_ARRAY)
                    gl.vertexAttribPointer(location,
                                           attrib.attribute.size,
                                           attrib.type,
                                           attrib.normalized,
                                           attrib.stride,
                                           attrib.offset)
                    if(!boundAttributes[location])
                        gl.enableVertexAttribArray(location)
                    boundAttributes[location] = 2
                })

                for(let i = boundAttributes.length - 1; i >= 0; i--){
                    let enabled = boundAttributes[i]
                    if(enabled === 2)
                        boundAttributes[i] = 1
                    else if(enabled === 1){
                        boundAttributes[i] = 0
                        gl.disableVertexAttribArray(i)
                    }
                }
                return target
            },
            render: (type, length, offset = 0) => {
                if(indexBuffer) gl.drawElements(type || gl.TRIANGLES,
                                                length || indexBuffer.indexData.length,
                                                gl.UNSIGNED_SHORT,
                                                offset * Uint16Array.BYTES_PER_ELEMENT)
                else gl.drawArrays(type || gl.TRIANGLES, offset, length)
            },
            unbind: _ => (vaoExtension && state.set('vao', null) && vaoExtension.bindVertexArrayOES(null), target),
            delete: _ => vaoExtension && vaoExtension.deleteVertexArrayOES(vao)
        }
        return target
    }
}

export default VertexArrayObject
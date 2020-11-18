export const VERTEX_ARRAY = 0x01
export const INDEX_ARRAY = 0x02

const VertexBufferObject = (gl, state) => (vertexArray, indexArray, dynamic = false) => {
    let vertexBuffer = null,
        indexBuffer = null
    if(vertexArray){
        if(vertexArray instanceof Array) vertexArray = new Float32Array(vertexArray)
        state.set('vertex', vertexBuffer = gl.createBuffer())
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW)
    }
    if(indexArray){
        if(indexArray instanceof Array) indexArray = new Uint16Array(indexArray)
        state.set('index', indexBuffer = gl.createBuffer())
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW)
    }
    const target = {
        get vertexBinding(){ return vertexBuffer },
        get indexBinding(){ return indexBuffer },
        get vertexData(){ return vertexArray },
        get indexData(){ return indexArray },
        upload: (length, offset = 0, array) => {
            target.bind(VERTEX_ARRAY)
            const subView = array || new Int32Array(vertexArray, Int32Array.BYTES_PER_ELEMENT * offset, length)
            gl.bufferSubData(gl.ARRAY_BUFFER, Int32Array.BYTES_PER_ELEMENT * offset, subView)
        },
        uploadIndices: (length, offset = 0, array) => {
            target.bind(INDEX_ARRAY)
            const subView = array || new Uint16Array(indexArray, Uint16Array.BYTES_PER_ELEMENT * offset, length)
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.BYTES_PER_ELEMENT * offset, subView)
        },
        bind: (flags = VERTEX_ARRAY | INDEX_ARRAY) => {
            if(flags & VERTEX_ARRAY && vertexBuffer && state.set('vertex', vertexBuffer))
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
			if(flags & INDEX_ARRAY && indexBuffer && state.set('index', indexBuffer))
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        },
        unbind: (flags = VERTEX_ARRAY | INDEX_ARRAY) => {
            if(flags & VERTEX_ARRAY && vertexBuffer && state.set('vertex', null))
                gl.bindBuffer(gl.ARRAY_BUFFER, null)
			if(flags & INDEX_ARRAY && indexBuffer && state.set('index', null))
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        },
        delete: _ => {
            gl.deleteBuffer(vertexBuffer)
            gl.deleteBuffer(indexBuffer)
        }
    }
    return target
}
export default VertexBufferObject
const isPow2 = n => n && (n & (n - 1))

const Texture = (gl, state) => () => {
    const texture = gl.createTexture()
    let width = 0,
        height = 0,
        format = gl.RGBA,
        precision = gl.UNSIGNED_BYTE
    
    
    const target = {
        get binding(){ return texture },
        get width(){ return width },
        get height(){ return height },
        bind: (location = 0) => {
			if(state.set('texture', location))
                gl.activeTexture(gl.TEXTURE0 + location)
			if(state.set(`texture${location}`, texture))
                gl.bindTexture(gl.TEXTURE_2D, texture)
		},
        upload: source => {
            width = source.videoWidth || source.width
            height = source.viewHeight || source.height
            target.bind()
            
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
            
            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, precision, source)
            return target
        },
        uploadData: (data, w, h) => {
            width = w
            height = h
            target.bind()
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, precision, data)
            return target
        },
        setWrap: (wrap) => {
            let wrapMode = wrap ? gl.REPEAT : gl.CLAMP_TO_EDGE
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode)
            return target
        },
        setFiltering: (minFiltering, magFiltering, mipmaps) => {
            let minFilteringMode = minFiltering ? gl.LINEAR : gl.NEAREST
            let magFilteringMode = magFiltering ? gl.LINEAR : gl.NEAREST
            if(isPow2(width) && isPow2(height) && mipmaps){
                minFilteringMode = minFiltering ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST
                gl.generateMipmap(gl.TEXTURE_2D)
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilteringMode)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilteringMode)
            return target
        },
        delete: _ => {
            gl.deleteTexture(texture)
        }
    }
    return target
}

export default Texture
export default gl => {
    const extensions = {
        vertex_array_object: gl.getExtension('OES_vertex_array_object') || gl.getExtension('MOZ_OES_vertex_array_object') || gl.getExtension('WEBKIT_OES_vertex_array_object'),
        depth_texture: gl.getExtension('WEBGL_depth_texture') || gl.getExtension('WEBKIT_WEBGL_depth_texture'),
        texture_float: gl.getExtension('OES_texture_float'),
        texture_float_linear: gl.getExtension("OES_texture_float_linear"),
        texture_half_float: gl.getExtension('OES_texture_half_float'),
        texture_half_float_linear: gl.getExtension('OES_texture_half_float_linear'),
        standadrd_derivatives: gl.getExtension('OES_standard_derivatives'),
    }
    
    if(extensions.texture_half_float)
        gl.HALF_FLOAT = extensions.texture_half_float.HALF_FLOAT_OES
    if(extensions.depth_texture)
        gl.UNSIGNED_INT_24_8 = extensions.depth_texture.UNSIGNED_INT_24_8_WEBGL
    
    return extensions   
}
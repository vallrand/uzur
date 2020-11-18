const GLSL_SIZE = {
    'float':    1,
    'vec2':     2,
    'vec3':     3,
    'vec4':     4,
    'mat2':     4,
    'mat3':     9,
    'mat4':     16,
    'sampler2D':  1
}

const GL_GLSL_TYPES = {
    'FLOAT': 'float',
    'FLOAT_VEC2': 'vec2',
    'FLOAT_VEC3': 'vec3',
    'FLOAT_VEC4': 'vec4',
    'FLOAT_MAT2':  'mat2',
    'FLOAT_MAT3':  'mat3',
    'FLOAT_MAT4':  'mat4',
    'SAMPLER_2D':  'sampler2D'  
}

const GLSL_SETTERS = {
    float: (gl, location, value) => gl.uniform1f(location, value),
    vec2: (gl, location, value) => gl.uniform2fv(location, value),
    vec3: (gl, location, value) => gl.uniform3fv(location, value),
    vec4: (gl, location, value) => gl.uniform4fv(location, value),
    mat2: (gl, location, value) => gl.uniformMatrix2fv(location, false, value),
    mat3: (gl, location, value) => gl.uniformMatrix3fv(location, false, value),
    mat4: (gl, location, value) => gl.uniformMatrix4fv(location, false, value),
    sampler2D: (gl, location, value) => gl.uniform1i(location, value),
}

const GLSL_ARRAY_SETTERS = {
    ...GLSL_SETTERS,
    float: (gl, location, value) => gl.uniform1fv(location, value),
    sampler2D: (gl, location, value) => gl.uniform1iv(location, value)
}

const generateUniformAccessObject = (gl, uniforms) => {
    const uao = Object.create(null)
    Object.keys(uniforms).forEach(name => {
        const uniform = uniforms[name]
        uniform.update = (uniform.size > 1 ? GLSL_ARRAY_SETTERS : GLSL_SETTERS)[uniform.type].bind(null, gl, uniform.location)
        Object.defineProperty(uao, name, {
            set: value => {
                uniform.value = value
                uniform.dirty = true
            }
        })
    })
    uao.update = (uniformList => _ => {
        for(let i = uniformList.length - 1; i >= 0; i--){
            let uniform = uniformList[i]
            if(!uniform.dirty) continue
            uniform.dirty = false
            uniform.update(uniform.value)
        }
    })(Object.values(uniforms))
    return uao
}

const setPrecision = (precision, src) => src.indexOf('precision') == -1 ?
    `precision ${precision}p float; ${src}` : src.replace(/(precision)([a-z ]+)(float)/i, `$1 ${precision}p $3`)

const Shader = (gl, state) => (vertSrc, fragSrc, bindings) => {
    const FRAG_PRECISION = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision,
          VERT_PRECISION = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision
    vertSrc = setPrecision(VERT_PRECISION ? 'high' : 'medium', vertSrc)
    fragSrc = setPrecision(FRAG_PRECISION ? 'high' : 'medium', fragSrc)
    const program = gl.createProgram(),
          vert = gl.createShader(gl.VERTEX_SHADER),
          frag = gl.createShader(gl.FRAGMENT_SHADER),
          attributes = Object.create(null),
          uniforms = Object.create(null)
    
    gl.shaderSource(vert, vertSrc)
    gl.compileShader(vert)
    if(!gl.getShaderParameter(vert, gl.COMPILE_STATUS))
		throw new Error(gl.getShaderInfoLog(vert))
    
    gl.shaderSource(frag, fragSrc)
    gl.compileShader(frag)
    if(!gl.getShaderParameter(frag, gl.COMPILE_STATUS))
		throw new Error(gl.getShaderInfoLog(frag))
    
	gl.attachShader(program, vert)
	gl.attachShader(program, frag)
    if(bindings) bindings.forEach(({index, name}) => gl.bindAttribLocation(program, index, name))
    gl.linkProgram(program)
    gl.deleteShader(vert)
	gl.deleteShader(frag)
	if(!gl.getProgramParameter(program, gl.LINK_STATUS))
		throw new Error(gl.getProgramInfoLog(program))
    
    Array.range(gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES))
        .map(i => gl.getActiveAttrib(program, i))
        .forEach(attrib => {
        const location = gl.getAttribLocation(program, attrib.name),
              type = GL_GLSL_TYPES[Object.keys(GL_GLSL_TYPES)
                                   .find(typeName => gl[typeName] === attrib.type)]
        attributes[attrib.name] = {
            location,
            size: GLSL_SIZE[type]
        }
    })
    
    Array.range(gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS))
        .map(i => gl.getActiveUniform(program, i))
        .forEach(uniform => {
        const name = uniform.name.replace(/\[.*\]$/, ''),
              type = GL_GLSL_TYPES[Object.keys(GL_GLSL_TYPES)
                                   .find(typeName => gl[typeName] === uniform.type)]
        uniforms[name] = {
            size: uniform.size,
            type,
            location: gl.getUniformLocation(program, name)
        }
    })
    
    const uao = generateUniformAccessObject(gl, uniforms)
    return {
        attributes, uniforms, uao,
        use: _ => {
			if(state.set('shader', program))
                gl.useProgram(program)
            uao.update()
		},
        delete: () => gl.deleteProgram(program),
        synchronize: new Function('s', 'v', Object.keys(uniforms)
            .map(uniform => `null!=v.${uniform}&&(s.${uniform}=v.${uniform});`)
            .join(''))
            .bind(null, uao)
    }
}
export default Shader

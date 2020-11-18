export const vec4 = (x = 0, y = x, z = x, w = 1) => new Float32Array([x, y, z, w])

vec4.copy = (v, out = vec4()) => {
	out[0] = v[0]
    out[1] = v[1]
    out[2] = v[2]
    if(v[3] != null) out[3] = v[3]
	return out
}

vec4.scale = (v, s, out = vec4()) => {
    out[0] = v[0] * s
    out[1] = v[1] * s
    out[2] = v[2] * s
    out[3] = v[3] * s
    return out
}

vec4.transform = (a, m, out = vec4()) => {
    let x = a[0], y = a[1], z = a[2], w = a[3]
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w
    return out
}
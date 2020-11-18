export const vec2 = (x = 0, y = x) => new Float32Array([x, y])

vec2.ZERO = vec2(0)

vec2.copy = (vec, out = vec2()) => {
    out[0] = vec[0]
    out[1] = vec[1]
    return out
}

vec2.transform = (vec, mat, out = vec2()) => {
    const x = vec[0], y = vec[1]
    out[0] = mat[0] * x + mat[2] * y + mat[4]
    out[1] = mat[1] * x + mat[3] * y + mat[5]
    return out
}

vec2.perpendicular = (vec, out = vec2()) => {
    const x = vec[0], y = vec[1]
    out[0] = -y
    out[1] = x
    return out
}

vec2.distance = (a, b) => {
    let dx = a[0] - b[0],
        dy = a[1] - b[1]
    return Math.sqrt(dx * dx + dy * dy)
}

vec2.magnitude = vec => Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1])

vec2.subtract = (a, b, out = vec2()) => {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    return out
}

vec2.add = (a, b, out = vec2()) => {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    return out
}

vec2.multiply = (a, b, out = vec2()) => {
    out[0] = a[0] * b[0]
    out[1] = a[1] * b[1]
    return out
}

vec2.scale = (v, s, out = vec2()) => {
    out[0] = v[0] * s
    out[1] = v[1] * s
    return out
}

vec2.fromAngle = (angle, length, out = vec2()) => {
    out[0] = length * Math.cos(angle)
    out[1] = length * Math.sin(angle)
    return out
}

vec2.angle = (a, b) => Math.atan2(a[0]*b[1] - a[1]*b[0], a[0]*b[0] + a[1]*b[1])

vec2.rotate = (vec, pivot, theta, out = vec2()) => {
    let dx = vec[0] - pivot[0],
        dy = vec[1] - pivot[1],
        sin = Math.sin(theta),
        cos = Math.cos(theta)
    out[0] = dx * cos - dy * sin + pivot[0]
    out[1] = dx * sin + dy * cos + pivot[1]
    return out
}
vec2.dot = (a, b) => a[0] * b[0] + a[1] * b[1]
vec2.normalize = (v, out = vec2()) => {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1]),
        inv = length && 1 / length
    out[0] = v[0] * inv
    out[1] = v[1] * inv
    return out
}
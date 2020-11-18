export const vec3 = (x = 0, y = x, z = x) => new Float32Array([x, y, z])

vec3.ZERO = vec3(0)

vec3.dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

vec3.copy = (v, out = vec3()) => {
	out[0] = v[0]; out[1] = v[1]; out[2] = v[2]
	return out
}

vec3.subtract = (a, b, out = vec3()) => {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  out[2] = a[2] - b[2]
  return out
}

vec3.cross = (a, b, out = vec3()) => {
  let ax = a[0], ay = a[1], az = a[2]
  let bx = b[0], by = b[1], bz = b[2]

  out[0] = ay * bz - az * by
  out[1] = az * bx - ax * bz
  out[2] = ax * by - ay * bx
  return out
}

vec3.magnitude = vec => Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2])

vec3.normalize = (a, out = vec3()) => {
    const [x, y, z] = a,
          length = Math.sqrt(x*x + y*y + z*z),
          invLength = length && 1 / length
    out[0] = x * invLength
    out[1] = y * invLength
    out[2] = z * invLength
    return out
}

vec3.scale = (a, b, out = vec3()) => {
  out[0] = a[0] * b
  out[1] = a[1] * b
  out[2] = a[2] * b
  return out
}


vec3.add = (a, b, out = vec3()) => {
  out[0] = a[0] + b[0]
  out[1] = a[1] + b[1]
  out[2] = a[2] + b[2]
  return out
}

vec3.multiply = (a, b, out = vec3()) => {
  out[0] = a[0] * b[0]
  out[1] = a[1] * b[1]
  out[2] = a[2] * b[2]
  return out
}

vec3.lerp = (a, b, f, out = vec3()) => {
    out[0] = Math.lerp(a[0], b[0], f)
    out[1] = Math.lerp(a[1], b[1], f)
    out[2] = Math.lerp(a[2], b[2], f)
    return out
}
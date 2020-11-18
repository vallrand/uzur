export const mat4 = _ => new Float32Array(16)

mat4.identity = (out = mat4()) => {
	out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0
	out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0
	out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0
	out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1
	return out
}

mat4.multiply = (a, b, out = mat4()) => {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]

  let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3]
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7]
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11]
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15]
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33
  return out
}

mat4.fromEuler = (x, y, z, out = mat4()) => {
    const sinx = Math.sin(x), siny = Math.sin(y), sinz = Math.sin(z),
          cosx = Math.cos(x), cosy = Math.cos(y), cosz = Math.cos(z)
    out[0] = cosy * cosz
    out[1] = cosy * sinz
    out[2] = -siny
    out[3] = 0.0

    out[4] = sinx * siny * cosz - cosx * sinz
    out[5] = sinx * siny * sinz + cosx * cosz
    out[6] = sinx * cosy
    out[7] = 0.0

    out[8] = cosx * siny * cosz + sinx * sinz
    out[9] = cosx * siny * sinz - sinx * cosz
    out[10] = cosx * cosy
    out[11] = 0.0

    out[12] = 0.0
    out[13] = 0.0
    out[14] = 0.0
    out[15] = 1.0
    return out
}

mat4.perspective = (fovy, aspectRatio, znear, zfar, out = mat4()) => {
    const f = 1.0 / Math.tan(fovy / 2),
    nf = 1 / (znear - zfar)
    out[0] = f / aspectRatio
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = (zfar + znear) * nf
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[14] = (2 * zfar * znear) * nf
    out[15] = 0
    return out
}
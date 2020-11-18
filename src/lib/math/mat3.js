export const mat3 = _ => new Float32Array(9)

mat3.copy = (mat, out = mat3()) => {
    out[0] = mat[0]; out[1] = mat[1]; out[2] = mat[2]
    out[3] = mat[3]; out[4] = mat[4]; out[5] = mat[5]
    out[6] = mat[6]; out[7] = mat[7]; out[8] = mat[8]
    return out
}

mat3.fromMat3x2 = (mat, out = mat3()) => {
    out[0] = mat[0]; out[1] = mat[1]; out[2] = 0
    out[3] = mat[2]; out[4] = mat[3]; out[5] = 0
    out[6] = mat[4]; out[7] = mat[5]; out[8] = 1
    return out
}

mat3.transpose = (mat, out = mat3()) => {
    out[0] = mat[0]; out[1] = mat[3]; out[2] = mat[6]
    out[3] = mat[1]; out[4] = mat[4]; out[5] = mat[7]
    out[6] = mat[2]; out[7] = mat[5]; out[8] = mat[8]
    return out
}

mat3.identity = (out = mat3()) => {
    out[0] = 1; out[1] = 0; out[2] = 0
    out[3] = 0; out[4] = 1; out[5] = 0
    out[6] = 0; out[7] = 0; out[8] = 1
    return out
}

mat3.projection = (width, height, offsetX, offsetY, out = mat3()) => {
    out[0] = 1 / width * 2
    out[1] = 0
    out[2] = -Math.sign(width) - offsetX * out[0]
    out[3] = 0
    out[4] = 1 / height * 2
    out[5] = -Math.sign(height) - offsetY * out[4]
    out[6] = 0
    out[7] = 0
    out[8] = 1
    return out
}

mat3.multiply = (a, b, out = mat3()) => { 
    const a00 = a[0], a01 = a[1], a02 = a[2],
          a10 = a[3], a11 = a[4], a12 = a[5],
          a20 = a[6], a21 = a[7], a22 = a[8],
          b00 = b[0], b01 = b[1], b02 = b[2],
          b10 = b[3], b11 = b[4], b12 = b[5],
          b20 = b[6], b21 = b[7], b22 = b[8]
    out[0] = b00 * a00 + b01 * a10 + b02 * a20
    out[1] = b00 * a01 + b01 * a11 + b02 * a21
    out[2] = b00 * a02 + b01 * a12 + b02 * a22

    out[3] = b10 * a00 + b11 * a10 + b12 * a20
    out[4] = b10 * a01 + b11 * a11 + b12 * a21
    out[5] = b10 * a02 + b11 * a12 + b12 * a22

    out[6] = b20 * a00 + b21 * a10 + b22 * a20
    out[7] = b20 * a01 + b21 * a11 + b22 * a21
    out[8] = b20 * a02 + b21 * a12 + b22 * a22
    return out
}
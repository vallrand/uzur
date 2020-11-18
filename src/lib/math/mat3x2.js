export const mat3x2 = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => new Float32Array([a, b, c, d, tx, ty])

mat3x2.copy = (mat, out = mat3x2()) => {
    out[0] = mat[0]
    out[1] = mat[1]
    out[2] = mat[2]
    out[3] = mat[3]
    out[4] = mat[4]
    out[5] = mat[5]
    return out
}

mat3x2.multiply = (matA, matB, out = mat3x2()) => {
    const [a0, b0, c0, d0, tx0, ty0] = matA,
          [a1, b1, c1, d1, tx1, ty1] = matB
    out[0] = a1 * a0 + b1 * c1
    out[1] = a1 * b0 + b1 * d0
    out[2] = c1 * a0 + d1 * c0
    out[3] = c1 * b0 + d1 * d0
    out[4] = tx1 * a0 + ty1 * c0 + tx0
    out[5] = tx1 * b0 + ty1 * d0 + ty0
    return out
}

mat3x2.fromTransform = (x, y, pivotX, pivotY, scaleX, scaleY, rotation, out = mat3x2()) => {
    const sin = Math.sin(rotation),
          cos = Math.cos(rotation),
          a = cos * scaleX,
          b = sin * scaleX,
          c = -sin * scaleY,
          d = cos * scaleY
    out[0] = a
    out[1] = b
    out[2] = c
    out[3] = d
    out[4] = x + pivotX * a + pivotY * c
    out[5] = y + pivotX * b + pivotY * d
    return out
}

mat3x2.invert = (mat, out = mat3x2()) => {
    const [a, b, c, d, tx, ty] = mat,
          det = a * d - b * c,
          invDet = det && 1 / det
    out[0] = d * invDet
    out[1] = -b * invDet
    out[2] = -c * invDet
    out[3] = a * invDet
    out[4] = (c * ty - d * tx) * invDet
    out[5] = (b * tx - a * ty) * invDet
    return out
}
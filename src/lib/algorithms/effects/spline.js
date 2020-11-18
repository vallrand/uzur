export const catmullRom = (p0, p1, p2, p3, f, tension = 0.5) => {
    const v0 = tension * (p2 - p0),
          v1 = tension * (p3 - p1)
    return (2 * p1 - 2 * p2 + v0 + v1) * f * f * f + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * f * f + v0 * f + p1
}

export const spline = (controlPoints, segments, interpolator, out = []) => {
    controlPoints.unshift(controlPoints[0])
    controlPoints.push(controlPoints[controlPoints.length - 1])
    out[0] = interpolator(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3], 0, out[0])
    for(let length = controlPoints.length - 3, i = 0, idx = 1; i < length; i++){
        let p0 = controlPoints[i + 0],
            p1 = controlPoints[i + 1],
            p2 = controlPoints[i + 2],
            p3 = controlPoints[i + 3]
        for(let s = 0; s < segments; s++, idx++){
            let f = (s + 1) / segments
            out[idx] = interpolator(p0, p1, p2, p3, f, out[idx])
        }
    }
    controlPoints.pop()
    controlPoints.shift()
    return out
}
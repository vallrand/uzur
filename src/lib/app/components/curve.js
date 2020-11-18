import { mat3x2, vec2, vec3, vec4 } from '../../math'
import { spline, catmullRom, Noise } from '../../algorithms'

function buildBaseLine(points, out = []){
    let totalDistance = 0,
        prevPoint = null
    for(let i = 0, length = out.length = points.length; i < length; i++){
        let srcPoint = points[i],
            destPoint = out[i] = out[i] || vec3()
        if(prevPoint) totalDistance += vec2.distance(srcPoint, prevPoint)
        prevPoint = srcPoint
        destPoint[0] = srcPoint[0]
        destPoint[1] = srcPoint[1]
        destPoint[2] = totalDistance
    }
    for(let i = out.length - 1; i >= 0; out[i--][2] /= totalDistance);
    return out
}

const splineInterpolator = (tension = 0.5) => (p0, p1, p2, p3, s, out = vec4()) => {
    out[0] = catmullRom(p0[0], p1[0], p2[0], p3[0], s, tension)
    out[1] = catmullRom(p0[1], p1[1], p2[1], p3[1], s, tension)
    out[2] = ((1-s) * p1[2] + s * p2[2])
    out[3] = s
    return out
}

const calculateNormals = (curve, out = []) => {
    for(let i = 0; i < curve.length; i++){
        let p0 = curve[i-1],
            p1 = curve[i],
            p2 = curve[i+1]
        let normal = out[i] = out[i] || vec2(0, 0)
        if(p0){
            normal[0] += p1[0] - p0[0]
            normal[1] += p1[1] - p0[1]
        }
        if(p2){
            normal[0] += p2[0] - p1[0]
            normal[1] += p2[1] - p1[1]
        }
        vec2.normalize(normal, normal)
        vec2.perpendicular(normal, normal)
    }
    return out
}

const noise = Noise(1)
const NoiseFilter = ({
    offsetScale = -1,
    frequency = 8,
    amplitude = 128
} = {}) => (curve, normals, offset = 0) => {
    for(let i = curve.length - 1; i >= 0; i--){
        let point = curve[i],
            normal = normals[i],
            envelope = point[3]
        let waveHeight = amplitude * envelope * (1 - envelope),
            randomOffset = noise.simplex2(offsetScale * offset + frequency * point[2], 0) * waveHeight
        point[0] += randomOffset * normal[0]
        point[1] += randomOffset * normal[1]
    }
    return curve
}

export const curveFactory = store => options => {
    const baseLine = [],
          splineCurve = [],
          normals = [],
          rgba = vec4(1, 1, 1, 1)
    let vertexArray = null,
        texture = null,
        dirtyFlag = false
    
    const position = vec3(0)
    let segments = 16,
        baseOffset = 0,
        lineWidth = 16,
        offset = 0
    
    function calculateSplineVertices(){
        if(!dirtyFlag || !baseLine.length) return false
        dirtyFlag = false
        spline(baseLine, segments, splineInterpolator(1), splineCurve)
        calculateNormals(splineCurve, normals)
        NoiseFilter({ offsetScale: 0.5, frequency: 10, amplitude: 100 })(splineCurve, normals, baseOffset + 2 * offset / 1000)
    }
    
    const entity = {
        set splineCurve(value){
            dirtyFlag = false
            splineCurve.set(value)
            calculateNormals(splineCurve, normals)
        },
        get textureData(){ return texture && texture.data },
        get texture(){
            return texture && texture.name
        },
        set texture(value){
            texture = store.requestSync(value)
        },
        get z(){ return position[2] },
        set z(value){
            if(position[2] === value) return
            position[2] = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        set controlPoints(value){
            buildBaseLine(value, baseLine)
            dirtyFlag = true
        },
        get alpha(){ return rgba[3] },
        set alpha(value){ rgba[3] = Math.clamp(value, 0, 1) },
        get rgba(){ return rgba },
        get color(){
            return  ((rgba[0] * 0xFF | 0) << 16) + 
                    ((rgba[1] * 0xFF | 0) << 8) + 
                    ((rgba[2] * 0xFF | 0))
        },
        set color(value){
            rgba[0] = ((value >> 16) & 0xFF) / 0xFF
            rgba[1] = ((value >> 8) & 0xFF) / 0xFF
            rgba[2] = (value & 0xFF) / 0xFF
        },
        get normals(){
            calculateSplineVertices()
            return normals
        },
        get vertices(){
            calculateSplineVertices()
            return splineCurve
        },
        get lineWidth(){ return lineWidth },
        set lineWidth(value){ lineWidth = value },
        get timeOffset(){ return -1 + 2.5 * (1 - (offset % 5000) / 5000) },
        set baseOffset(value){ baseOffset = value },
        get offset(){ return offset / 5000 },
        set offset(value){
            offset = value * 5000
            dirtyFlag = true
        },
        set segments(value){
            segments = value
            dirtyFlag = true
        }
    }
    return Object.assign(entity, options)
}

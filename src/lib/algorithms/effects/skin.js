import { vec2 } from '../../math'

export const SkeletonHull = verletSystem => {
    const bindPose = verletSystem.constraints
    .filter(constraint => constraint.nodeB && !constraint.nodeC)
    .map(constraint => {
        let { nodeA, nodeB } = constraint,
            middle = vec2.add(nodeA.position, nodeB.position)
        vec2.scale(middle, 0.5, middle)
        return {
            nodes: [nodeA, nodeB], middle
        }
    })
    let transform = bindPose.map(bone => ({
        get offset(){ return bone.nodes[0].position },
        axisX: vec2(),
        axisY: vec2()
    }))
    
    function updateTransform(){
        for(let i = transform.length - 1; i >= 0; i--){
            let [ nodeA, nodeB ] = bindPose[i].nodes,
                { axisX, axisY } = transform[i]
            axisX[0] = nodeB.position[0] - nodeA.position[0]
            axisX[1] = nodeB.position[1] - nodeA.position[1]
            axisY[0] = nodeA.position[1] - nodeB.position[1]
            axisY[1] = nodeB.position[0] - nodeA.position[0]
            vec2.normalize(axisX, axisX)
            vec2.normalize(axisY, axisY)
        }
    }
    
    return {
        get transform(){ return transform },
        updateTransform
    }
}

function attachVertex(vertex, boneTransform){
    const { axisX, axisY, offset } = boneTransform,
          direction = vec2.subtract(vertex, offset)
    return vec2(vec2.dot(axisX, direction),
                vec2.dot(axisY, direction))
}

export const MeshSkin = ({
    transform, vertexArray, deformVertices, groups
}) => {
    const weights = []
    
    function joinVertex(localPosition, boneGroup, radius){
        let boneWeights = [],
            totalWeight = 0
        boneGroup.forEach(idx => {
            let bone = transform[idx]
            let joint = attachVertex(localPosition, bone)
            let distance = vec2.distance(bone.offset, localPosition)
            distance = Math.pow(radius, 4) - Math.pow(distance, 4)
            if(distance <= 0) return false
            totalWeight += distance
            boneWeights.push({
                idx, weight: distance, origin: joint,
                x: joint[0], y: joint[1]
            })
        })
        boneWeights.forEach(joint => joint.weight /= totalWeight)
        return boneWeights
    }
    
    groups.forEach(({ radius, bones, vertices }) => vertices.forEach(idx => {
        let vertex = vec2(vertexArray[idx*2+0], vertexArray[idx*2+1])
        weights[idx] = joinVertex(vertex, bones, radius)
    }))
    
    function updateTransform(){
        weights.forEach((bones, idx) => {
            let position = vec2(0, 0)
            bones.forEach(bone => {
                let t = transform[bone.idx],
                    { weight, x, y } = bone
                position[0] += weight * (t.offset[0] + x * t.axisX[0] + y * t.axisY[0])
                position[1] += weight * (t.offset[1] + x * t.axisX[1] + y * t.axisY[1])
            })
            vertexArray[idx*2+0] = position[0]
            vertexArray[idx*2+1] = position[1]
        })
    }
    
    function prepareDeformation(deformVertices){
        let minWaveX = Infinity,
            maxWaveX = -Infinity
        for(let i = deformVertices.length - 2; i >= 0; i-=2){
            minWaveX = Math.min(minWaveX, deformVertices[i])
            maxWaveX = Math.max(maxWaveX, deformVertices[i])
        }
        weights.forEach((bones, idx) => {
            let offsetVertex = vec2(deformVertices[idx*2+0],
                                    deformVertices[idx*2+1])
            bones.forEach(joint => {
                let offsetJoint = attachVertex(offsetVertex, transform[joint.idx])
                joint.deform = {
                    f: 1,
                    offset: (offsetVertex[0] - minWaveX) / (maxWaveX - minWaveX),
                    x: offsetJoint[0],
                    y: offsetJoint[1]
                }
            })
        })
    }
    
    deformVertices && prepareDeformation(deformVertices)
    
    function updateDeformation(waves){
        weights.forEach(bones => bones.forEach(joint => {
            joint.deform.f = waves.reduce((combined, factor) => {
                let linear = 2 * factor + 1 + joint.deform.offset
                let cosine = Math.pow(Math.max(0, Math.cos(Math.PI * linear - 0.5 * Math.PI)), 3)
                return Math.max(combined, cosine) //combined + cosine
            }, 0)
            joint.x = joint.deform.f * joint.deform.x + (1 - joint.deform.f) * joint.origin[0]
            joint.y = joint.deform.f * joint.deform.y + (1 - joint.deform.f) * joint.origin[1]
        }))
    }
    return {
        updateTransform,
        updateDeformation
    }
}
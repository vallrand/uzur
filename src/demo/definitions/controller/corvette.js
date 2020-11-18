import { vec2, mat3x2 } from '../../../lib/math'
import { VerletSystem, SkeletonHull, MeshSkin } from '../../../lib/algorithms'

const data = {
    vertices: [
        24,-18,
        8,-22,
        -16,-30,
        -26,-31,
        -56,-24,
        -62,-22,
        -88,-15,
        -94,-14,
        30,-74,
        14,-131,
        2,-127,
        -38,-94,
        -46,-88,
        -70,-66,
        -76,-62,
        -100,-44,
        -106,-38,
        -118,-6,
        -140,-4,
        32,-4,
        4,-10,
        -30,-20,
        -60,-12,
        -92,-6,
        -156,-2,
        -174,1,
        -188,5,
        -202,8,
        -220,13,
        -240,10,
        -244,22,
        -240,42,
        -218,22,
        -203,14,
        -190,14,
        -176,12,
        -159,10,
        30,6,
        -3, 9,
        -19,-4,
        -47,-6,
        -74,-3,
        -104,1,
        -128,1,
        29,14,
        28,38,
        -6,34,
        -22,46,
        -32,20,
        -47,41,
        -62,14,
        -72,34,
        -90,16,
        -100,26,
        -116,12,
        -126,21,
        -142,9,
        13,46,
        8,56,
        10,65,
        14,76,
        24,89,
        -6,109,
        -12,90,
        -16,74,
        -12,61,
        -11,48
    ],
    deformVertices: [
        28,-110,
        16,-104,
        -21,-84,
        -31,-83,
        -59,-66,
        -68,-58,
        -92,-43,
        -99,-38,
        26,-116,
        7,-151,
        2,-147,
        -46,-118,
        -51,-112,
        -75,-82,
        -79,-78,
        -108,-60,
        -109,-48,
        -119,-36,
        -141,-28,
        28,-68,
        4,-42,
        -20,-38,
        -55,-36,
        -89,-20,
        -159,-30,
        -174,-21,
        -188,-13,
        -202,-12,
        -223,-1,
        -270,-22,
        -262,30,
        -258,88,
        -223,36,
        -206,40,
        -187,40,
        -171,52,
        -159,52,
        31,-30,
        -11,9,
        -24,20,
        -47,18,
        -75,21,
        -101,21,
        -131,11,
        28,70,
        16,80,
        -15,82,
        -27,68,
        -35,64,
        -47,67,
        -61,62,
        -72,72,
        -89,56,
        -100,68,
        -113,56,
        -131,61,
        -139,53,
        10,76,
        8,80,
        10,85,
        14,92,
        24,89,
        -6,109,
        -12,104,
        -16,96,
        -17,81,
        -16,80
    ],
    indices: [
        0,1,10,
        0,10,9,
        0,9,8,
        2,3,11,
        12,11,3,
        4,5,13,
        14,13,5,
        6,7,15,
        16,15,7,
        1,2,11,
        11,1,10,
        3,4,13,
        13,3,12,
        5,6,15,
        15,5,14,
        7,17,16,
        16,17,18,
        0,19,20,
        0,1,20,
        2,3,21,
        4,5,22,
        6,7,23,
        28,29,30,
        28,32,30,
        31,32,30,
        24,36,35,
        35,24,25,
        25,35,34,
        34,25,26,
        26,34,33,
        33,26,27,
        27,33,32,
        32,27,28,
        2,1,39,
        4,3,40,
        6,5,41,
        42,7,17,
        17,43,18,
        18,36,24,
        37,19,20,
        46,45,44,
        38,46,44,
        44,37,38,
        38,20,37,
        39,1,20,
        39,20,38,
        39,2,21,
        40,3,21,
        40,4,22,
        41,5,22,
        41,6,23,
        23,7,42,
        36,18,56,
        56,43,18,
        56,43,55,
        54,43,17,
        54,42,17,
        23,42,52,
        52,41,23,
        41,22,50,
        22,40,50,
        21,40,48,
        21,48,39,
        39,38,46,
        43,55,54,
        54,42,53,
        42,52,53,
        52,41,51,
        51,41,50,
        50,49,40,
        49,48,40,
        39,48,47,
        47,46,39,
        55,54,53,
        53,52,51,
        51,50,49,
        49,48,47,
        57,66,46,
        57,45,46,
        57,66,58,
        58,65,66,
        58,65,59,
        59,64,65,
        66,47,46,
        59,64,60,
        60,63,64,
        60,63,61,
        61,62,63
    ],
    jointGroups: [
        {
            bones: [0,1,2,3,4,5],
            radius: 78,
            vertices: [17, 18, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 42, 43, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56]
        },
        {
            bones: [0],
            radius: 155,
            vertices: [0, 1, 8, 9, 10, 19, 20, 37, 38, 44, 45, 46]
        },
        {
            bones: [1],
            radius: 155,
            vertices: [2, 3, 11, 12, 21, 39]
        },
        {
            bones: [2],
            radius: 155,
            vertices: [4, 5, 13, 14, 22, 40]
        },
        {
            bones: [3],
            radius: 155,
            vertices: [6, 7, 15, 16, 23, 41]
        },
        {
            bones: [6, 7],
            radius: 155,
            vertices: [57]
        },
        {
            bones: [6, 7, 8],
            radius: 155,
            vertices: [58, 66]
        },
        {
            bones: [7, 8],
            radius: 155,
            vertices: [59, 60, 61, 64, 65]
        },
        {
            bones: [8],
            radius: 155,
            vertices: [62, 63]
        }
    ]
}

export const Corvette = (stage, texture) => {
    const vs = VerletSystem()
    vs.add(0, -15, 0.8)
    vs.add(-30, -10, 0.8)
    vs.add(-60, -5)
    vs.add(-90, 0)
    vs.add(-120, 0)
    vs.add(-150, 0)
    vs.add(-180, 0)
    vs.constraint.distance(1, 0, 30)
    vs.constraint.distance(2, 1, 30)
    vs.constraint.distance(3, 2, 30)
    vs.constraint.distance(4, 3, 30)
    vs.constraint.distance(5, 4, 30)
    vs.constraint.distance(6, 5, 30)
    vs.constraint.angle(0, 1, 2, Math.PI - Math.PI/32, 1.0*Math.PI/4)
    vs.constraint.angle(1, 2, 3, Math.PI - Math.PI/32, 1.1*Math.PI/4)
    vs.constraint.angle(2, 3, 4, Math.PI - Math.PI/32, 1.2*Math.PI/4)
    vs.constraint.angle(3, 4, 5, Math.PI - Math.PI/32, 1.3*Math.PI/4)
    vs.constraint.angle(4, 5, 6, Math.PI - Math.PI/32, 1.4*Math.PI/4)

    vs.add(0, 30)
    vs.constraint.distance(7, 0, 45)
    vs.constraint.angle(1, 0, 7, -Math.PI / 2, 0)

    vs.add(0, 60)
    vs.add(0, 90)
    vs.constraint.distance(8, 7, 30)
    vs.constraint.distance(9, 8, 30)
    vs.constraint.angle(0, 7, 8, Math.PI, Math.PI/4)
    vs.constraint.angle(7, 8, 9, Math.PI, Math.PI/3)
    
    const vertices = new Float32Array(data.vertices)
    
    const skeleton = SkeletonHull(vs)
    skeleton.updateTransform()
    const skin = MeshSkin({
        transform: skeleton.transform,
        vertexArray: vertices,
        groups: data.jointGroups,
        deformVertices: data.deformVertices
    })
    skin.updateTransform()
    
    let deformationTimeScale = 0.02,
        deformationWaves = []
    
    const mesh = stage.create({
        type: 'mesh',
        texture,
        z: 0,
        data: {
            vertices, indices: data.indices,
            scale: [0.18, 0.18],
            offset: [-100, -15]
        },
        scaleX: 0.75,
        scaleY: 0.75
    }) 
    
    vs.applyTransform(mat3x2(1, 0, 0, 1, -0.25 * mesh.scaleX * stage.width, 0))
    const coordinates = vec2()
    
    return {
        coordinates,
        get color(){ return mesh.colorMask },
        set color(value){ mesh.colorMask = value },
        addWave: (offset = 0) => deformationWaves.unshift(offset),
        get rotation(){
            const [ head, neck ] = vs.nodes
            return Math.atan2(head.position[1] - neck.position[1], head.position[0] - neck.position[0])
        },
        update: (deltaTime, movement) => {
            vs.nodes.forEach((node, idx) => {
                if(idx === 0 && movement){
                    vec2.scale(movement, deltaTime * 60, movement)
                    vec2.add(node.position, movement, node.position)
                }else if(idx > 6){
                    node.position[1] += deltaTime * 60 * 2
                    node.position[0] -= deltaTime * 60 * 0.75
                }else{
                    node.position[0] -= deltaTime * 60 * 0.75
                }
            })
            vs.integrate(deltaTime)
            vec2.multiply(vs.nodes[0].position, [ mesh.scaleX, mesh.scaleY ], coordinates)
            
            skeleton.updateTransform()
            skin.updateTransform()
            
            for(let i = deformationWaves.length - 1; i >= 0; i--)
                if((deformationWaves[i] += deformationTimeScale) > 1)
                    deformationWaves.splice(i, 1)
            skin.updateDeformation(deformationWaves)
        }
    }
}
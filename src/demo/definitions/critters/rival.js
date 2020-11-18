import { vec2, mat3x2, shortestAngle } from '../../../lib/math'
import { VerletSystem, SkeletonHull, MeshSkin } from '../../../lib/algorithms'

import { DissipateDeath, Lifecycle } from '../effects'
import { RECOLOR_PREFIX } from '../adjustTone'

const data = {
    vertices: [
        -1,-44,
        -7,48,
        2,50,
        8,-43,
        -29,-30,
        -19,-93,
        -38,-92,
        -38,-31,
        -70,-37,
        -70,-125,
        -91,-122, 
        -79,-40, 
        -118,-39, 
        -122,-129, 
        -141,-124, 
        -128,-40, 
        -155,-33, 
        -167,-76, 
        -166,-29, 
        -32,27, 
        -34,100, 
        -50,90, 
        -40,28, 
        -70,41, 
        -78,123, 
        -98,120, 
        -80,48, 
        -112,47, 
        -118,139, 
        -140,129, 
        -122,54, 
        -154,52, 
        -167,104, 
        -165,53, 
        -17,-20,
        -20,21,
        -58,-35,
        -56,34,
        -97,44,
        -101,-38,
        -142,-34,
        -139,51,
        -191,-24,
        -190,49,
        -234,-20,
        -233,49,
        -274,-16,
        -269,44,
        -306,-12,
        -303,39,
        -345,-6, 
        -348,31, 
        -420,0,
        -420,17,
        -5,-3, 
        -34,-2,
        -72,-2,
        -118,2,
        -160,10,
        -210,12,
        -250,13,
        -290,12,
        -331,12,
    ],
    indices: [
        0,1,2,
        0,2,3,
        4,5,6,
        4,6,7,
        8,9,10,
        8,10,11,
        12,13,14,
        12,14,15,
        16,17,18,
        19,20,21,
        19,21,22,
        23,24,25,
        23,25,26,
        27,28,29,
        27,29,30,
        31,32,33,
        0,34,54,
        54,35,1,
        0,34,4,
        4,5,0,
        6,7,36,
        6,36,8,
        6,8,9,
        10,11,39,
        10,39,12,
        10,12,13,
        14,15,40,
        14,40,16,
        14,16,17,
        17,18,42,
        35,1,19,
        19,1,20,
        37,22,21,
        37,21,23,
        23,21,24,
        38,26,25,
        38,25,27,
        27,25,28,
        41,30,29,
        41,29,31,
        31,29,32,
        33,32,43,
        42,59,44,
        44,60,46,
        46,61,48,
        48,62,50,
        52,50,62,
        59,43,45,
        60,45,47,
        61,47,49,
        62,49,51,
        62,51,53,
        52,62,53,
        42,18,58,
        58,33,43,
        4,34,55,
        55,35,19,
        18,16,58,
        16,40,58,
        40,15,57,
        15,12,57,
        12,39,57,
        39,11,56,
        11,8,56,
        8,36,56,
        36,7,55,
        7,4,55,
        58,31,33,
        58,41,31,
        57,30,41,
        57,27,30,
        57,38,27,
        56,26,38,
        56,23,26,
        56,37,23,
        55,19,22,
        55,22,37,
        34,54,35,
        34,35,55,
        36,55,37,
        36,37,56,
        39,56,38,
        39,38,57,
        40,57,41,
        40,41,58,
        42,58,43,
        42,43,59,
        44,59,45,
        44,45,60,
        46,60,47,
        46,47,61,
        48,61,49,
        48,49,62
    ],
    jointGroups: [{
        bones: [0],
        radius: 155,
        vertices: [0,1,2,3,54]
    }, {
        bones: [1],
        radius: 155,
        vertices: [4,5,6,7,19,20,21,22]
    }, {
        bones: [2],
        radius: 155,
        vertices: [8,9,10,11,23,24,25,26]
    }, {
        bones: [3],
        radius: 155,
        vertices: [12,13,14,15,27,28,29,30]
    }, {
        bones: [4],
        radius: 155,
        vertices: [16,17,18,31,32,33]
    }, {
        bones: [0,1],
        radius: 155,
        vertices: [34,35]
    }, {
        bones: [1,2],
        radius: 155,
        vertices: [36,37]
    }, {
        bones: [2,3],
        radius: 155,
        vertices: [38,39]
    }, {
        bones: [3,4],
        radius: 155,
        vertices: [40,41]
    }, {
        bones: [4,5],
        radius: 155,
        vertices: [42,43,44,45]
    }, {
        bones: [4,5,6],
        radius: 155,
        vertices: [46,47,48,49,58,59,60,61]
    }, {
        bones: [5,6],
        radius: 155,
        vertices: [50,51,52,53,62]
    }, {
        bones: [0,1,2],
        radius: 155,
        vertices: [55]
    }, {
        bones: [1,2,3],
        radius: 155,
        vertices: [56]
    }, {
        bones: [2,3,4],
        radius: 155,
        vertices: [57]
    }]
}

const RivalFish = (stage, { texture, x, y, scale }) => {
    const vs = VerletSystem()
    vs.add(0, 0, 0.7)
    vs.add(-35, 0, 0.75)
    vs.add(-75, 0, 0.8)
    vs.add(-120, 5, 0.8)
    vs.add(-160, 10, 0.8)
    vs.add(-220, 10, 0.85)
    vs.add(-260, 10, 0.9)
    vs.add(-330, 10, 0.9)
    
    vs.constraint.distance(1, 0, 35, 0.7)
    vs.constraint.distance(2, 1, 40, 0.5)
    vs.constraint.distance(3, 2, 45, 0.4)
    vs.constraint.distance(4, 3, 40, 0.3)
    vs.constraint.distance(5, 4, 40, 0.2)
    vs.constraint.distance(6, 5, 60, 0.1)
    vs.constraint.distance(7, 6, 70, 0.1)
    
    vs.constraint.angle(0, 1, 2, Math.PI, 1.0 * Math.PI / 8, 0.01)
    vs.constraint.angle(1, 2, 3, Math.PI, 1.0 * Math.PI / 8, 0.01)
    vs.constraint.angle(2, 3, 4, Math.PI, 1.0 * Math.PI / 8, 0.01)
    vs.constraint.angle(3, 4, 5, Math.PI, 1.5 * Math.PI / 8, 0.01)
    vs.constraint.angle(4, 5, 6, Math.PI, 2.0 * Math.PI / 8, 0.01)
    vs.constraint.angle(5, 6, 7, Math.PI, 3.0 * Math.PI / 8, 0.01)
    
    const vertices = new Float32Array(data.vertices)
    const skeleton = SkeletonHull(vs)
    skeleton.updateTransform()
    const skin = MeshSkin({
        transform: skeleton.transform,
        vertexArray: vertices,
        groups: data.jointGroups
    })
    skin.updateTransform()
    
    const mesh = stage.create({
        type: 'mesh',
        texture,
        data: {
            vertices, indices: data.indices,
            scale: [-1, 1],
            offset: [-200, 0]
        },
        scaleX: scale,
        scaleY: scale
    })
    
    const head = vec2(x, y)
    vs.applyTransform(mat3x2.fromTransform(x / scale, y / scale, 0, 0, 1, 1, Math.PI))
    
    return {
        mesh, head,
        get width(){ return mesh.textureData.width * scale },
        get height(){ return mesh.textureData.height * scale },
        update: deltaTime => {
            vec2.scale(head, 1 / scale, vs.nodes[0].position)
            vs.integrate(deltaTime)
            vec2.scale(vs.nodes[0].position, scale, head)
            
            skeleton.updateTransform()
            skin.updateTransform()
        }
    }
}

export default (facade, {
    x: spawnX,
    y: spawnY,
    ambient, size,
    velocity = vec2(-76, 0)
}) => {
    const fish = RivalFish(facade, {
        texture: `${RECOLOR_PREFIX}assets/textures/rival_fish.png`,
        x: spawnX, y: spawnY,
        scale: size * Math.randomFloat(0.5, 0.64)
    })
    let speed = vec2.magnitude(velocity)
    let angle = Math.atan2(velocity[1], velocity[0])
    
    const [ objective ] = facade.delegate.queryAll(entity => entity.type === 'controller')
    
    facade.procedure((deltaTime, time) => {
        vec2.fromAngle(angle, speed * deltaTime, velocity)
        vec2.add(fish.head, velocity, fish.head)
        
        const difference = vec2.subtract(objective.coordinates, fish.head)
        const desiredAngle = Math.atan2(difference[1], difference[0])
        
        angle += deltaTime * Math.PI * 1.0 * Math.sin(6 * time + 0.5 * Math.PI)
        angle += deltaTime * shortestAngle(angle, desiredAngle)
        
        fish.update(deltaTime)
        
        if(vec2.dot(difference, difference) < Math.pow(facade.instance.boundingRadius + objective.boundingRadius, 2))
            objective.handle('damage', { value: deltaTime * 10, type: 'continuous' })
    })
    
    facade.registerEventHandler('death', DissipateDeath(facade), false)
    facade.registerEventHandler('damage', Lifecycle(facade, {
        health: 750 * size,
        update: health => fish.mesh.colorMask = [ 1, health, health ]
    }))
    
    return {
        velocity,
        coordinates: fish.head,
        boundingRadius: 0.5 * Math.min(fish.width, fish.height)
    }
}
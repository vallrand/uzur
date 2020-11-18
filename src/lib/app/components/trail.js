import { mat3x2, vec2, vec3, vec4 } from '../../math'

const cleanupTrailData = entity => {
    entity.gradient = null
    entity.particles = []
}

export const trailFactory = store => options => {
    const position = vec2(0),
          scale = vec2(1)
    let zOrder = 0,
        colorMatrix = null,
        particles = [],
        lifetime,
        cycleDuration = 1,
        time = 0
    
    const entity = {
        get z(){ return zOrder },
        set z(value){
            if(zOrder === value) return
            zOrder = value
            if(entity.parent) entity.parent.entities.reorder(entity)
        },
        get lifetime(){ return lifetime },
        set lifetime(value){ lifetime = value },
        get duration(){ return cycleDuration },
        set duration(value){ cycleDuration = value || 1 },
        set particles(value){
            particles = value.map(({
                position, count, 
                timeOffset = 0,
                width = 1,
                forceRange = vec2.ZERO,
                setup
            }) => Array.range(count).map(idx => ({
                timeOffset, width, position,
                segments: 10,
                velocity: vec2.fromAngle(Math.randomFloat(0, 2 * Math.PI), Math.randomFloat(forceRange[0], forceRange[1])),
                acceleration: vec2(0, 9.8),
                ...setup && setup(idx)
            }))).flatten()
            if(entity.vertexData){
                entity.vertexData.delete()
                delete entity.vertexData
            }
        },
        get gradient(){ return colorMatrix },
        set gradient(value){
            colorMatrix = value
            if(entity.textureData){
                entity.textureData.delete()
                delete entity.textureData
            }
        },
        get transformData(){
            return mat3x2.fromTransform(position[0], position[1], 0, 0, scale[0], scale[1], 0)
        },
        computeVertices(){
            const indexArray = [],
                  vertexArray = []
            let index = 0,
                indexOffset = 0
            particles.forEach(({
                segments,
                position,
                velocity,
                acceleration,
                timeOffset,
                width
            }) => {
                for(let i = 0; i < segments; i++){
                    let trailOffset = i / (segments - 1)
                    
                    vertexArray[index++] = position[0]
                    vertexArray[index++] = position[1]
                    vertexArray[index++] = velocity[0]
                    vertexArray[index++] = velocity[1]
                    vertexArray[index++] = acceleration[0]
                    vertexArray[index++] = acceleration[1]
                    vertexArray[index++] = trailOffset
                    vertexArray[index++] = timeOffset
                    vertexArray[index++] = width

                    vertexArray[index++] = position[0]
                    vertexArray[index++] = position[1]
                    vertexArray[index++] = velocity[0]
                    vertexArray[index++] = velocity[1]
                    vertexArray[index++] = acceleration[0]
                    vertexArray[index++] = acceleration[1]
                    vertexArray[index++] = trailOffset
                    vertexArray[index++] = timeOffset
                    vertexArray[index++] = -width
                    
                    if(!i) continue
                    indexArray.push(
                        indexOffset + (i - 1) * 2 + 0,
                        indexOffset + (i - 1) * 2 + 1,
                        indexOffset + (i + 0) * 2 + 0,
                        indexOffset + (i + 0) * 2 + 0,
                        indexOffset + (i - 1) * 2 + 1,
                        indexOffset + (i + 0) * 2 + 1
                    )
                }
                indexOffset += 2 * segments
            })
            return {
                indices: new Uint16Array(indexArray),
                vertices: new Float32Array(vertexArray)
            }
        },
        set time(value){ time = value },
        get time(){ return Math.mod(time, cycleDuration) }
    }
    Object.assign(entity, options)
    entity.cleanupProcedures.push(cleanupTrailData)
    return entity
}
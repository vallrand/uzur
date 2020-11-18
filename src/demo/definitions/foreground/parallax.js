import { vec2 } from '../../../lib/math'

export const ParallaxBackground = (stage, {
    layerAmount = 1,
    scaleRange = vec2(1, 0.5),
    chunkLength = stage.width,
    deviation = 0.2,
    padding = 0.16,
    
    bottomLine = 0.5 * stage.height,
    generators
}) => {
    const position = vec2(0, 0)
    const layers = Array.range(layerAmount).map(index => ({
        index,
        depth: index / layerAmount,
        offset: vec2(0, 0),
        elements: [],
        scale: Math.lerp(scaleRange[0], scaleRange[1], index / (layerAmount - 1) || 0)
    }))
    
    const populateChunk = (layer, groupIndex) => generators.map(generate => {
        //TODO use seed for rng
        const elements = generate(),
              length = chunkLength * layer.scale,
              offsetX = groupIndex * length,
              segmentWidth = length / elements.length,
              rangeX = deviation * segmentWidth
        
        return elements.map((properties, idx) => Object.assign(properties, {
            offsetX: offsetX + Math.clamp(idx * segmentWidth + Math.randomInt(-rangeX, rangeX), 0, elements.length * segmentWidth),
            offsetY: bottomLine
        }))
    }).flatten()
    .map(properties => stage.create({
        x: properties.offsetX - layer.offset[0],
        y: properties.offsetY - layer.offset[1],
        scaleX: layer.scale,
        scaleY: layer.scale,
        groupIndex,
        z: 16 * (1 - 2 * layer.index),
        ambient: layer.depth,
        ...properties
    }))
    
    return {
        get x(){ return position[0] },
        set x(value){ position[0] = value },
        update: deltaTime => {
            layers.forEach(layer => {
                let { elements, offset } = layer
                vec2.scale(position, layer.scale, offset)
                let min = Math.floor((offset[0] - (padding + 0.5) * stage.width) / (chunkLength * layer.scale)),
                    max = Math.floor((offset[0] + (padding + 0.5) * stage.width) / (chunkLength * layer.scale))

                for(let i = elements.length - 1, next = elements[i], edge = max; edge >= min || i >= 0;){
                    let element = next,
                        value = element && element.groupIndex

                    if(i < 0 || edge > value && edge >= min)
                        elements.splice(i + 1, 0, ...populateChunk(layer, edge--))
                    else if(value < min || edge < value && i >= 0)
                        next = (elements.splice(i, 1)[0].delete(), elements[--i])
                    else{
                        element.x = element.offsetX - offset[0]
                        element.y = element.offsetY - offset[1]
                        next = elements[--i]
                        edge -= !next || next.groupIndex != value
                    }
                }
            })
        },
        delete: () => {
            layers.forEach(layer => layer.elements.forEach(element => element.delete()))
            layers.length = 0
        }
    }
}

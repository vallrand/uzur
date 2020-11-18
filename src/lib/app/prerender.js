import { combine } from '../util'
import { vec2, mat3, mat3x2, vec4, colorMatrix } from '../math'
import { binpack } from '../algorithms'
import { packUvData, computeUvData, TextureData } from './parsers'

const redefine = store => (name, data) => {
    const prevResource = store.values[name],
          prevTexture = prevResource && prevResource.data && prevResource.data.texture
    if(prevTexture && Object.values(store.values)
       .filter(resource => resource && resource.data && resource.data.texture && resource.data.texture === prevTexture)
       .length == 1)
        prevTexture.delete()
    store.define(name, {
        name,
        ...data
    })
}

export default (store, webgl) => stage =>
void redefine(store)('blank.png', {
    type: 'texture',
    data: TextureData(webgl.defaultTexture)
}) ||
combine(stage, {
    prerender: ({
        textures,
        prefix = '',
        colorMatrix = colorMatrix.identity
    }) => {
        const { width, height, packed } = binpack(
            textures
            .map(store.requestSync)
            .map(({ name, data: { width, height } }) => ({
                name, width, height
            }))
        )
        
        const layer = stage.create({
            type: 'layer',
            frame: {
                filters: [{
                    type: 'color',
                    colorMatrix
                }],
                width, height,
                backgroundColor: vec4(0, 0, 0, 0)
            }
        })
        
        const components = packed.map(({ x, y, item: { name, width, height } }) => layer.create({
            type: 'bitmap',
            texture: name,
            pivotX: 0, pivotY: 0,
            scaleX: 1, scaleY: 1,
            x: x - 0.5 * layer.width,
            y: y - 0.5 * layer.height,
            textureFrame: { offsetX: x, offsetY: y, width, height }
        }))
        
        webgl.render([ layer ], null)
        const framebuffer = layer.renderTarget.swapFramebuffer(null)
        const textureAtlas = framebuffer.swapTexture(null)
        
        components.forEach(({ textureFrame, texture }) =>
            redefine(store)(`${prefix}${texture}`, {
                type: 'subtexture',
                data: {
                    texture: textureAtlas,
                    size: vec2(textureFrame.width, textureFrame.height),
                    width: textureFrame.width,
                    height: textureFrame.height,
                    offsetX: 0, offsetY: 0,
                    uvs: packUvData(computeUvData(textureFrame, textureAtlas))
                }
            }))

        framebuffer.delete()
        layer.delete()
    },
    generateTexture: ({
        name,
        width = stage.width,
        height = stage.height,
        render
    }) => {
        const layer = stage.create({
            type: 'layer',
            frame: {
                filters: [],
                width, height,
                backgroundColor: vec4(0, 0, 0, 0)
            }
        })
        
        render(layer)
        
        webgl.render([ layer ], null)
        const framebuffer = layer.renderTarget.swapFramebuffer(null)
        const texture = framebuffer.swapTexture(null)
        framebuffer.delete()
        layer.delete()
        
        redefine(store)(name, {
            type: 'texture',
            data: TextureData(texture)
        })
    }
})
import { vec2 } from '../../math'

export const packUvData = (uvs, out = new Uint32Array(4)) => {
    out[0] = (((uvs[0][1] * 0xFFFF) & 0xFFFF) << 16) | ((uvs[0][0] * 0xFFFF) & 0xFFFF)
    out[1] = (((uvs[1][1] * 0xFFFF) & 0xFFFF) << 16) | ((uvs[1][0] * 0xFFFF) & 0xFFFF)
    out[2] = (((uvs[2][1] * 0xFFFF) & 0xFFFF) << 16) | ((uvs[2][0] * 0xFFFF) & 0xFFFF)
    out[3] = (((uvs[3][1] * 0xFFFF) & 0xFFFF) << 16) | ((uvs[3][0] * 0xFFFF) & 0xFFFF)
    return out
}

export const TextureData = texture => ({
    texture,
    size: vec2(texture.width, texture.height),
    width: texture.width,
    height: texture.height,
    offsetX: 0,
    offsetY: 0,
    uvs: packUvData([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1]
    ])
})

export const parseImageData = ctx => resource => resource.type === 'image' &&
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('error', reject)
        image.addEventListener('load', resolve.bind(null, image))
        image.src = resource.data.dataURI
    }).then(imageSrc => Object.assign(resource, {
        type: 'texture',
        data: TextureData(
            ctx.Texture()
            .upload(imageSrc)
            .setWrap(false)
            .setFiltering(true, true, false)
        )
    }))
import { vec2 } from '../../math'
import { path } from '../../util'
import { packUvData } from './texture'

export const computeUvData = (frame, baseFrame) => {
    const { width, height } = baseFrame
    return [
        [
            frame.offsetX / width,
            frame.offsetY / height
        ],
        [
            (frame.offsetX + frame.width) / width,
            frame.offsetY / height
        ],
        [
            (frame.offsetX + frame.width) / width,
            (frame.offsetY + frame.height) / height
        ],
        [
            frame.offsetX / width,
            (frame.offsetY + frame.height) / height
        ]
    ]
}

export const parseTextureAtlas = (resource, store) => {
    if(resource.type !== 'json' || !resource.data.frames) return false
    
    const { name, data: { frames, meta: { image, size } } } = resource
    const textureFilename = path(name).basedir + image
    return store.request(textureFilename).then(({ data: atlas }) =>
        Object.keys(frames).forEach(keyFrame => {
            const { frame, spriteSourceSize, sourceSize } = frames[keyFrame]
            store.define(keyFrame, {
                name: keyFrame,
                type: 'subtexture',
                data: {
                    texture: atlas.texture,
                    size: vec2(sourceSize.w, sourceSize.h),
                    width: spriteSourceSize.w,
                    height: spriteSourceSize.h,
                    offsetX: spriteSourceSize.x,
                    offsetY: spriteSourceSize.y,
                    uvs: packUvData(computeUvData({
                            width: frame.w,
                            height: frame.h,
                            offsetX: frame.x,
                            offsetY: frame.y
                    }, atlas))
                }
            })
        }))
}

export const parseSoundSprite = (resource, store) => {
    if(resource.type !== 'json' || !resource.data.spritemap) return false
    
    const { name, data: { soundfile, spritemap } } = resource
    const soundFilename = path(name).basedir + soundfile
    
    return store.request(soundFilename).then(({ data: sound }) =>
        Object.keys(spritemap).forEach(spriteName => {
            let [ start, duration ] = spritemap[spriteName]
            start *= 1e-3
            duration *= 1e-3
            
            store.define(spriteName, {
                name: spriteName,
                type: 'soundclip',
                data: {
                    buffer: sound.buffer,
                    start, duration
                }
            })
    }))
}
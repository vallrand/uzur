import { vec3, mat3x2 } from '../math'
import { AudioNode, AudioParameter } from './audioNode'

export const SpatialListener = ctx => {
    const position = vec3(0, 0, 0)
    const orientation = mat3x2.copy([
        0, 0, -1,
        0, 1, 0
    ])
    
    const forward = vec3(0, 0, -1)
    const up = vec3(0, 1, 0)
    
    return {
        get position(){ return position },
        set position(value){
            vec3.copy(value, position)
            if(!ctx.listener.positionX)
                ctx.listener.setPosition(...position)
            else{
                ctx.listener.positionX.setValueAtTime(position[0], ctx.currentTime)
                ctx.listener.positionY.setValueAtTime(position[1], ctx.currentTime)
                ctx.listener.positionZ.setValueAtTime(position[2], ctx.currentTime)
            }
        },
        get orientation(){ return orientation },
        set orientation(value){
            mat3x2.copy(value, orientation)
            if(!ctx.listener.forwardX)
                ctx.listener.setOrientation(...orientation)
            else{
                ctx.listener.forwardX.setValueAtTime(orientation[0], ctx.currentTime)
                ctx.listener.forwardY.setValueAtTime(orientation[1], ctx.currentTime)
                ctx.listener.forwardZ.setValueAtTime(orientation[2], ctx.currentTime)
                ctx.listener.upX.setValueAtTime(orientation[4], ctx.currentTime)
                ctx.listener.upY.setValueAtTime(orientation[6], ctx.currentTime)
                ctx.listener.upZ.setValueAtTime(orientation[7], ctx.currentTime)
            }
        }
    }
}

export const PannerNode = AudioNode(ctx => {
    const pannerNode = ctx.audio.createPanner()
    const position = vec3(0, 0, 0)
    const orientation = vec3(1, 0, 0)
    ctx.reconnect(pannerNode)
    
    Object.assign(pannerNode, {
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 10000,
        rolloffFactor: 1,
        coneInnerAngle: 360,
        coneOuterAngle: 0,
        coneOuterGain: 0
    })
    
    return {
        get position(){ return position },
        set position(value){
            vec3.copy(value, position)
            if(!pannerNode.positionX)
                pannerNode.setPosition(...position)
            else{
                pannerNode.positionX.setValueAtTime(position[0], ctx.audio.currentTime)
                pannerNode.positionY.setValueAtTime(position[1], ctx.audio.currentTime)
                pannerNode.positionZ.setValueAtTime(position[2], ctx.audio.currentTime)
            }
        },
        get orientation(){ return orientation },
        set orientation(value){
            vec3.copy(value, orientation)
            if(!pannerNode.orientationX)
                pannerNode.setOrientation(...orientation)
            else{
                pannerNode.orientationX.setValueAtTime(orientation[0], ctx.audio.currentTime)
                pannerNode.orientationY.setValueAtTime(orientation[1], ctx.audio.currentTime)
                pannerNode.orientationZ.setValueAtTime(orientation[2], ctx.audio.currentTime)
            }
        }
    }
})
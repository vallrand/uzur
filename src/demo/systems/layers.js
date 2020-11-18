import { terminate } from '../../lib/util'
import { vec2, mat3, mat3x2, color, vec3, vec4, colorMatrix } from '../../lib/math'
import { ease, postEffectReroute } from '../../lib/algorithms'

export const Layers = (system, stage) => ({
    ['initialize']: () => {
        system.layers = Object.create(null)
        
        system.layers['surface'] = stage.create({
            type: 'layer',
            frame: {
                filters: [{
                    type: 'glare',
                    projectionMatrix: mat3.identity(),
                    seaColor: vec3(1),
                    time: 0
                }],
                width: stage.width,
                height: stage.height,
                backgroundColor: vec4(0,0,0,0)
            },
            destination: {
                x: 0, y: 0, z: -1,
                scaleX: 1, scaleY: 1,
                rotation: 0
            }
        })
        system.procedure(deltaTime => {
            system.layers['surface'].delegate.filters[0].time += deltaTime
        }) 
        
        system.environment = environment => system.queryAll(entity => entity.type === environment)[0] || system.create(environment)
        
        system.layers['liquid'] = stage.create({
            type: 'layer',
            frame: {
                filters: [{
                    type: 'threshold',
                    projectionMatrix: mat3.fromMat3x2(mat3x2.fromTransform(-0.005, 0, 0, 0, 1, 1, 0)),
                    edgeColor: vec4(0, 0, 0, 1),
                    edgeWidth: 16,
                    equipotential: 0.25
                }],
                width: stage.width,
                height: stage.height,
                backgroundColor: vec4(0, 0, 0, 0)
            },
            destination: {
                x: 0, y: 0, z: 1,
                scaleX: 1, scaleY: 1,
                rotation: 0
            }
        })
        
        system.layers['dissolve'] = stage.create({
            type: 'layer',
            frame: {
                filters: [{
                    type: 'dissolve',
                    projectionMatrix: mat3.fromMat3x2(mat3x2.fromTransform(-0.005, 0, 0, 0, 1, 1, 0)),
                    edgeColor: vec3(0, 0, 0)
                }],
                width: stage.width,
                height: stage.height
            },
            destination: {
                x: 0, y: 0, z: 1,
                scaleX: 1, scaleY: 1,
                rotation: 0
            }
        })
    },
    ['establish']: ({ palette }) => {
        system.layers['dissipate'] = ({ components, timeScale = 0.1, edgeWidth = 0.1, end }) => {
            const layer = stage.create({
                type: 'layer',
                frame: {
                    filters: [{
                        type: 'dissipate',
                        projectionMatrix: mat3.identity(),
                        edgeColor: palette.primary,
                        edgeWidth,
                        time: 0
                    }],
                    width: stage.width,
                    height: stage.height,
                    backgroundColor: vec4(0, 0, 0, 0)
                },
                destination: {
                    x: 0, y: 0, z: 1,
                    scaleX: 1, scaleY: 1,
                    rotation: 0
                }
            })

            components.forEach(layer.delegate.aquire)
            return deltaTime => {
                layer.delegate.filters[0].time += timeScale * deltaTime

                if(layer.delegate.filters[0].time > 1 + 2 * edgeWidth)
                    return end && end(), layer.delete(), terminate
            }
        }
        
        system.layers['shockwave'] = ({ components, source, timeScale = 1, update, end }) => {
            const layer = postEffectReroute(stage, {
                filters: [{
                    type: 'chromaticAbberation',
                    projectionMatrix: mat3.identity(),
                    rotation: 0.25 * Math.PI,
                    offset: 0
                }, {
                    type: 'shockwave',
                    projectionMatrix: mat3.identity(),
                    center: vec2(
                        (source[0] / stage.width) + 0.5,
                        (source[1] / stage.height) + 0.5
                    ),
                    radius: -1,
                    amplitude: 0.2,
                    wavelength: 0.2
                }]
            })
            let time = 0
            return deltaTime => {
                time += timeScale * deltaTime

                layer.filters[0].offset = 10 * ease.sine(Math.pow(time, 1.2))
                layer.filters[1].radius = -0.2 + ease.powerOut(2)(0.2 * time)
                layer.filters[1].wavelength = 0.2 + 0.1 * time
                layer.filters[1].amplitude = -Math.min(0.8, 0.05 + ease.powerIn(2)(0.2 * time)) * Math.min(1, 5 - time)

                if(update(time / 5) === terminate || time > 5)
                    return layer.delete(), end(), terminate
            }
        }

        system.layers['surface'].delegate.filters[0].seaColor = vec3.scale(palette.fade, 1.82)
        system.layers['dissolve'].delegate.filters[0].edgeColor = palette.primary
        system.layers['liquid'].delegate.filters[0].edgeColor = vec4.copy(vec3.scale(palette.fade, 0.25))
    }
})
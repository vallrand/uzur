import { vec4 } from '../../math'

export const postEffectReroute = (stage, { filters }) => {
    const tempStage = stage.factory(null)({
        type: 'layer',
        frame: {
            width: stage.width,
            height: stage.height,
            renderTarget: stage.renderTarget,
            backgroundColor: stage.backgroundColor
        },
        layers: stage.layers,
        factory: stage.factory
    })
    stage.alpha = 0
	stage.parent = tempStage
    const layer = tempStage.create({
        type: 'layer',
        frame: {
            filters,
            width: stage.width,
            height: stage.height,
            entities: stage.entities,
            backgroundColor: vec4(0, 0, 0, 0)
        },
        destination: {
            x: 0, y: 0, z: 0,
            scaleX: 1, scaleY: 1,
            rotation: 0
        }
    })
    
    layer.cleanupProcedures.unshift(() =>
        layer.delegate.entities = []
    )
    layer.cleanupProcedures.push(() => {
        tempStage.delete()
        stage.alpha = 1
		delete stage.parent
    })
    return layer.delegate
}
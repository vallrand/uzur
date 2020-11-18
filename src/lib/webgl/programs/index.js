export { default as batchedProgram } from './batched'
export { default as meshProgram } from './mesh'
export { default as sphereProgram } from './sphere'
export { default as curveProgram } from './curve'
export { default as trailProgram } from './trail'
export { default as planeProgram } from './plane'
export { default as layerProgram } from './layer'

export default (programs, renderTargetManager) =>
    function render(entities, renderTarget = renderTargetManager.root){
        renderTargetManager.switchContext(renderTarget)
        let currentProgram = null
        
        for(let length = entities.length, i = 0; i < length; i++){
            let entity = entities[i],
                program = programs[entity.program]
            if(entity.alpha === 0) continue
            if(currentProgram != program && currentProgram)
                currentProgram.flush()
            currentProgram = program
            currentProgram.render(entity)
        }
        currentProgram && currentProgram.flush()
    }
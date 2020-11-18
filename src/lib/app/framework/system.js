import { Transmitter } from '../../util'

export const SystemManager = (stage, systems) => {
    const systemManager = Transmitter()
    
    systems.map(system => system(systemManager, stage))
        .forEach(system => system && Object.keys(system)
                 .forEach(event => systemManager.subscribe(event, system[event])))
    
    return Object.assign(systemManager, {
        procedure: stage.updateProcedures.push.bind(stage.updateProcedures)
    })
}
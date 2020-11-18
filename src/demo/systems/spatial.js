import { vec2 } from '../../lib/math'

export const Spatial = (system, stage) => {
    const entities = []
    const cleanup = entities.remove.bind(entities)
    
    Object.assign(system, {
        queryNeighbours: (targetPosition, targetRadius) => {
            return entities.filter(({ coordinates, boundingRadius, alive }) => {
                let dx = coordinates[0] - targetPosition[0],
                    dy = coordinates[1] - targetPosition[1]
                return alive && dx*dx + dy*dy < Math.pow(targetRadius + boundingRadius, 2)
            })
        },
        queryAll: entities.filter.bind(entities)
    })
    
    return {
        ['instantiate']: entity => {
            if(!entity.coordinates) return
            
            entities.push(entity)
            entity.cleanupProcedures.push(cleanup)
            if(entity.alive == null) entity.alive = true
        }
    }
}
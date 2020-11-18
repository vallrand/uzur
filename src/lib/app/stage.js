import { clock, Pool, debounce, combine, terminate } from '../util'
import { vec3, vec4 } from '../math'
import { OrderedArray, LinkedList } from '../algorithms'
import { Layer } from './components'

export default factories => {
    const layers = OrderedArray([], (a, b) => b.depth - a.depth)
    const cleanup = entity => entity.cleanupProcedures.forEach(procedure => procedure.call(null, entity))
    const detach = entity => entity.parent = entity.parent && void entity.parent.entities.remove(entity)
    
    const updateProcedures = LinkedList()
    clock.listen(deltaTime => updateProcedures.enabled &&
        updateProcedures.forEach(procedure =>
            procedure(Math.min(1 / 60, 1e-3 * deltaTime)) === terminate && updateProcedures.remove(procedure)))
    
    const factory = root => ({ type, ...options }) => {
        if(!factories[type])
            throw new Error(`Type "${type}" is not defined in factory.`)
        const entity = factories[type]({
            program: type,
            parent: root,
            cleanupProcedures: [ detach ],
            ...options
        })
        entity.delete = cleanup.bind(null, entity)
        root && !entity.depth && root.entities.insert(entity)
        return entity
    }
    
    return options => factory(null)({
        ...options,
        layers,
        factory,
        updateProcedures
    })
}
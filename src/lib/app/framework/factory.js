import { combine, terminate, Transmitter, orderedInsert } from '../../util'
import enterScope from './scope'
import entityGroup from './group'

export const Factory = providers => (mediator, stage) =>
void Object.assign(mediator, {
    create: (type, properties = {}) => {
        const provider = providers[type]
        if(!provider) throw new Error(`"${type}" not defined in factory.`)

        const entity = Object.create(null),
              transmitter = Transmitter(),
              components = [],
              procedures = [],
			  deferredProcedures = [],
			  insertDefferedProcedure = orderedInsert.bind(null, procedures, (a, b) => !b || a.priority - b.priority)
        let elapsedTime = 0
        
        const update = deltaTime => {
			while(deferredProcedures.length) insertDefferedProcedure(deferredProcedures.pop())
            elapsedTime += deltaTime
            for(let i = procedures.length - 1; i >= 0; i--)
                if(!procedures[i] || procedures[i].call(entity, deltaTime, elapsedTime) === terminate)
                    procedures.splice(i, 1)
        }
        
        const proxy = {
            stage, delegate: mediator, transmitter,
            scope: enterScope,
            group: entityGroup,
            instance: entity,
            get width(){ return stage.width },
            get height(){ return stage.height },
            create: ({ layer = stage, ...options }) => {
                const component = layer.create(options)
                component.cleanupProcedures.push(components.remove.bind(components))
                return components[components.push(component) - 1]
            },
            procedure: (procedure, priority = 0) => {
				procedure.priority = priority
                deferredProcedures.unshift(procedure)
                return procedure
            },
            clear(filter){
                for(let i = components.length - 1; i >= 0; i--)
                    if(filter(components[i])) components.splice(i, 1)[0].delete()
                for(let i = procedures.length - 1; i >= 0; i--)
                    if(filter(procedures[i])) procedures[i] = null
            },
            registerEventHandler: transmitter.subscribe
        }
        
        Object.assign(entity, {
            type,
            components,
            procedures,
            cleanupProcedures: [
                stage.updateProcedures.remove.bind(stage.updateProcedures, update),
                transmitter.clear,
                proxy.clear.bind(proxy, item => true)
            ],
            handle: transmitter.dispatch,
            delete: () => entity.cleanupProcedures.forEach(cleanup => cleanup(entity))
        })

        combine(entity, provider(proxy, properties) || {})

        stage.updateProcedures.push(update)
        mediator.dispatch('instantiate', entity)

        properties.timeOffset && update(properties.timeOffset)
        return entity
    }
})
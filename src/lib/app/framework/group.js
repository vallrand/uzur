export default function(){
    const entities = []
	const clear = () => entities.slice().forEach(entity => entity.delete())
    this.instance.cleanupProcedures.push(clear)
    
    return {
        entities,
		clear,
        create: (type, properties) => {
            const entity = this.delegate.create(type, properties)
            entity.cleanupProcedures.push(entities.remove.bind(entities))
            entities.push(entity)
            return entity
        }
    }
}
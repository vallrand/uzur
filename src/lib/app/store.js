const values = Object.create(null),
      consumers = Object.create(null)

export default {
    get consumers(){ return consumers },
    get values(){ return values },
    define: (key, value) => {
        values[key] = value
        if(consumers[key] instanceof Array)
            consumers[key].forEach(resolve => resolve(value))
    },
    request: key => {
        if(values[key]) return Promise.resolve(values[key])
        return new Promise(resolve => (consumers[key] = consumers[key] || []).push(resolve))
    },
    requestSync: key => {
        if(!values[key])
            throw new Error(`Requested resource "${key}" was not found.`)
        return values[key]
    }
}
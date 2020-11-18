import { parseDataURI } from './base64'

export const parser = (store, middleware) => resources => 
    Promise.all(Object.keys(resources)
        .map(name => new Promise((resolve, reject) => {
            const resource = {
                name,
                data: resources[name]
            }
            const next = idx => middleware[idx] ? 
                  Promise.resolve(middleware[idx](resource, store))
                    .then(next.bind(null, idx + 1))
                    .catch(reject) : resolve(resource)
            next(0)
        }).then(resource => store.define(resource.name, resource))))

export const detectResourceType = resource => {
    if(typeof resource.data === 'object')
        resource.type = 'json'
    else if(typeof resource.data === 'string'){
        const { type, ...data } = parseDataURI(resource.data)
        Object.assign(resource, {
            type, data
        })
    }
}
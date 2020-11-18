export function debounce(callback, delay = 0){
    let timeout = null
    return function(...args){
        if(timeout) clearTimeout(timeout)
        timeout = setTimeout(callback.apply.bind(callback, this, args), delay)
    }
}

export const Emitter = start => {
    const consumers = []
    function dispatch(...args){
        for(let length = consumers.length, i = 0; i < length; i++)
            consumers[i].apply(this, args)
    }
    return Object.assign(start(dispatch) || Object.create(null), {
        listen: consumers.push.bind(consumers)
    })
}

export const Transmitter = () => {
    const transmitter = Object.create(null),
          subscribers = Object.create(null)
    return Object.assign(transmitter, {
        dispatch: (eventName, payload) => new Promise((resolve, reject) => {
            const executors = (subscribers[eventName] = subscribers[eventName] || []).slice()
            executors.forEach(executor => executor.continuous || transmitter.unsubscribe(eventName, executor))
            const next = ctx => executors.length ? Promise.resolve(executors.shift())
            .then(executor => 
                executor.call(transmitter, payload, ctx)
            ).catch(reject)
            .then(next) : resolve(ctx)
            next()
        }),
        subscribe: (eventName, callback, continuous = true) =>
            (subscribers[eventName] = subscribers[eventName] || [])
            .push((callback.continuous = continuous, callback)),
        unsubscribe: (eventName, callback) => subscribers[eventName] && callback
            ? subscribers[eventName].remove(callback)
            : subscribers[eventName].length = 0,
        clear: () => Object.keys(subscribers).forEach(eventName => delete subscribers[eventName])
    })
}

export const PromiseQueue = () => {
    const unresolved = []
    return {
        dispatch: payload => {
            unresolved.forEach(resolve => resolve(payload))
            unresolved.length = 0
        },
        await: () => new Promise(resolve => unresolved.push(resolve))
    }
}

export const fixedInterval = (callback, fixedStep = 1e3 / 60) => {
    let step = 0
    return deltaTime => {
        for(step -= deltaTime; step < 0; step += fixedStep)
            callback(fixedStep)
    }
}

export const terminate = false
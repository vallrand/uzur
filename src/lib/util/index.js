export * from './polyfills'
export * from './utility'
export * from './events'
export * from './path'
export * from './pool'
export * from './url'

import { Emitter, debounce } from './events'

export const visibility = Emitter(dispatch => {
    const prefixes = ['webkit','moz','ms','o'],
          visibilityProperty = ('hidden' in document) ? 'hidden' : prefixes
    .map(prefix => prefix + 'Hidden')
    .find(property => (property in document))
    if(visibilityProperty)
        document.addEventListener(visibilityProperty.slice(0, -6) + 'visibilitychange', event =>
                                  dispatch(!window.document[visibilityProperty]), false)
})

export const clock = Emitter(dispatch => {
    let requestId = null,
        prevTimestamp = null
    function update(timestamp = performance.now()){
        requestId = requestAnimationFrame(update)
        let deltaTime = +prevTimestamp && timestamp - prevTimestamp
        prevTimestamp = timestamp
        dispatch(deltaTime)
    }
    function reset(){
        cancelAnimationFrame(requestId)
        requestId = prevTimestamp = null
    }
    visibility.listen(focus => focus ? requestId || update() : reset())
    update()
})

export const resize = Emitter(dispatch => window.addEventListener('resize', debounce(event => dispatch([ innerWidth, innerHeight ]), 10)))
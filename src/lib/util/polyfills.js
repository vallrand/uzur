if(!Object.assign)
    Object.assign = function(target, ...args){
        for(let i = 0; i < args.length; i++){
            let source = args[i]
            if(!source) continue
            for(var key in source)
                if(Object.prototype.hasOwnProperty.call(source, key))
                    target[key] = source[key]
        }
        return target
    }
if(!Object.values)
    Object.values = function(target){
        return Object.keys(target).map(key => target[key])
    }
if(!Object.setPrototypeOf)
    Object.setPrototypeOf = function(target, proto){
        target.__proto__ = proto
        return target 
    }
if(!Object.getOwnPropertyDescriptors)
    Object.getOwnPropertyDescriptors = function(target){
        let descriptors = Object.create(null)
        for(let property in target)
            if(Object.prototype.hasOwnProperty.call(target, property))
                descriptors[property] = Object.getOwnPropertyDescriptor(target, property)
        return descriptors
    }
if(!Object.defineProperties)
    Object.defineProperties = function(target, descriptors){
        for(let property in descriptors)
            Object.defineProperty(target, property, descriptors[property])
        return target
    }
export const UniqueKey = window.Symbol ? Symbol : (function(){
    let id = 0
    return () => `__id:${++id}__`
})()
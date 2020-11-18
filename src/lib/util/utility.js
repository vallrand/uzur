Array.range = (min = 0, max) => {
    if(max === undefined){
        max = min
        min = 0
    }
    const out = []
    for(let i = 0, length = max-min; i < length; i++)
        out[i] = i + min
    return out
}

Array.transpose = function(array){
    const out = []
    for(let width = array.length, columnIdx = 0; columnIdx < width; columnIdx++)
        for(let column = array[columnIdx], height = column.length, rowIdx = 0; rowIdx < height; rowIdx++)
            (out[rowIdx] = out[rowIdx] || [])[columnIdx] = column[rowIdx]
    return out
}

Array.prototype.zip = function(...arrays){
    const combine = arrays.pop(),
          length = arrays[0].length
    for(let idx = 0; idx < length; idx++)
        this[idx] = combine(...arrays.map(array => array[idx]), idx)
    return this
}

Array.prototype.flatten = function(out = []){
    for(let length = this.length, i = 0; i < length; i++)
        out = out.concat(this[i])
    return out
}

Array.prototype.remove = function(...elements){
    for(let i = elements.length - 1; i >= 0; i--){
        let idx = this.indexOf(elements[i])
        if(idx != -1) this.splice(idx, 1)
    }
    return this
}

Array.prototype.unique = function(){
    return this.filter((element, index, array) => array.indexOf(element) === index)
}

Array.prototype.insert = function(...items){
    for(let i = items.length - 1; i >= 0; i--){
        let idx = this.indexOf(items[i])
        if(idx == -1) this.unshift(items[i])
    }
    return this
}

Array.prototype.shuffle = function(random = Math.random){
    for(let j, i = this.length; i; (j = (random() * i--) | 0), [this[i], this[j]] = [this[j], this[i]]);
    return this
}

Array.prototype.set = function(array){
    this.length = array.length
    for(let i = this.length - 1; i >= 0; i--)
        this[i] = array[i]
    return this
}

Function.prototype.once = function(){
	let original = this
	return function(...args){
        original = (original && original.call(this, ...args), null)
    }
}

Object.map = function(target, mapper){
    const out = Object.create(null)
    for(let key in target)
        out[key] = mapper(target[key], key)
    return out
}

Object.combine = function(baseObject, ...args){
    args.forEach(object => {
        let descriptors = Object.getOwnPropertyDescriptors(object)
        for(let property in descriptors)
            Object.defineProperty(baseObject, property, descriptors[property])
    })
    return baseObject
}

Object.nullify = function(target){
    for(let key in target)
        delete target[key]
}

//TODO Object.combine
export function combine(baseObject, ...args){
    args.forEach(object => {
        let descriptors = Object.getOwnPropertyDescriptors(object)
        for(let property in descriptors)
            Object.defineProperty(baseObject, property, descriptors[property])
    })
    return baseObject
}

export function orderedInsert(array, sort, item){
	let index = 0
	for(let length = array.length; index < length; index++)
		if(sort(item, array[index]) <= 0) break
	array.splice(index, 0, item)
	return index
}
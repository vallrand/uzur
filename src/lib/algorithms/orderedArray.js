export const OrderedArray = (array, comparator) => Object.defineProperties(array, {
    reorder: {
        enumerable: false,
        writable: true,
        value: (...order) => {
            if(!order.length)
                for(let idx, i = 0, length = array.length; i < length; i++){
                    const value = array[i]
                    for(idx = i - 1; idx >= 0 && comparator(array[idx], value) > 0; array[idx + 1] = array[idx--]);
                    array[idx + 1] = value
                }
            else if(order.length == 1)
                array.insert(order[0])
            else{
                const indices = order.map(item => array.indexOf(item)).sort((a, b) => a - b)
                order.forEach((item, idx) => array[indices[idx]] = item)
            }
            return array
        }
    },
    insert: {
        enumerable: false,
        writable: true,
        value: value => {
            let idx = array.indexOf(value)
            if(idx != -1) array.splice(idx, 1)
            for(idx = array.length - 1; idx >= 0 && comparator(array[idx], value) > 0; idx--);
            array.splice(idx + 1, 0, value)
        }
    }
})

export const DelegateArray = (array, insert, remove) => Object.defineProperties(array, {
    remove: {
        enumerable: false,
        value: function(item){
            let idx = array.indexOf(item)
            if(idx == -1) return
            array.splice(idx, 1)
            remove(item)
        }
    },
    insert: {
        enumerable: false,
        value: function(item){
            let idx = array.indexOf(item)
            if(idx != -1) return
            array.push(item)
            insert(item)
        }
    }
})
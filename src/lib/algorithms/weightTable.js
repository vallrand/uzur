export const WeightTable = weights => {
    const total = Object.values(weights).map(weight => Math.max(0, weight) | 0).reduce((total, weight) => total + weight, 0),
          items = Object.keys(weights),
          lookupArray = new Uint32Array(total)
    for(let idx = 0, i = items.length - 1; i >= 0; i--)
        for(let j = weights[items[i]]; j > 0; j--)
            lookupArray[idx++] = i
    return {
        get length(){ return total },
        item: index => items[lookupArray[index]]
    }
}
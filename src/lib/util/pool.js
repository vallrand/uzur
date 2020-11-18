export const Pool = factoryFunction => {
    const pool = []
    let index = 0
    return {
        get size(){ return pool.length },
        allocate: size => {
            let extend = Math.max(pool.length - size, 0)
            while(extend--) pool.push(factoryFunction(index++))
        },
        clear: _ => pool.length = 0,
        obtain: _ => pool.pop() || factoryFunction(index++),
        release: (...items) => pool.push(...items)
    }
}
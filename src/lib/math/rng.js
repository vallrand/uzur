export const MersenneTwister = (seed = Date.now()) => {
    const N = 624,
          M = 397,
          MATRIX_A = 0x9908b0df,
          UPPER_MASK = 0x80000000,
          LOWER_MASK = 0x7fffffff,
          mt = new Array(N)
    let idx = N
    
    function reseed(seed){
        mt[0] = seed >>> 0
        for(let i = 1; i < N; i++){
            let s = mt[i-1] ^ (mt[i-1] >>> 30)
            mt[i] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + i
            mt[i] >>>= 0
        }
        idx = N
    }
    
    function regenerate(){
        let kk, y, mag01 = [0x0, MATRIX_A]
        
        for(kk = 0; kk < N-M; kk++){
            y = (mt[kk] & UPPER_MASK) | (mt[kk+1] & LOWER_MASK)
            mt[kk] = mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1]
        }
        for(; kk < N-1; kk++){
            y = (mt[kk] & UPPER_MASK) | (mt[kk+1] & LOWER_MASK)
            mt[kk] = mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1]
        }
        y = (mt[N-1] & UPPER_MASK) | (mt[0] & LOWER_MASK)
        mt[N-1] = mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1]
        
        idx = 0
    }

    reseed(seed)
    return Object.assign(function generate(){
        let y, kk, mag01 = [0x0, MATRIX_A]
        
        if(idx >= N) regenerate()
        
        y = mt[idx++]
        y ^= (y >>> 11)
        y ^= (y << 7) & 0x9d2c5680
        y ^= (y << 15) & 0xefc60000
        y ^= (y >>> 18)
        return (y >>> 0) * (1.0 / 4294967296.0)
    }, { reseed })
}

export const nativeRandom = Math.random
export const random = Math.random = MersenneTwister()

Math.randomFloat = (min, max, rng = random) => rng() * (max - min) + min
Math.randomInt = (min, max, rng = random) => Math.floor(rng() * (max - min + 1)) + min
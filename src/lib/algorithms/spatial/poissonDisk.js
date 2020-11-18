export const PoissonDisk = ({
    width, height, radius,
    maxIterations = 30,
    rng = Math.random
}) => {
    const radiusSquared = radius * radius,
          outerRadius = 3 * radiusSquared,
          cellSize = radius * Math.SQRT1_2,
          gridWidth = Math.ceil(width / cellSize),
          gridHeight = Math.ceil(height / cellSize),
          grid = Array(gridWidth * gridHeight),
          queue = []
    let sampleSize = 0
    
    function far(x, y){
        let c = x / cellSize | 0,
            r = y / cellSize | 0
        
        const minX = Math.max(c - 2, 0),
              minY = Math.max(r - 2, 0),
              maxX = Math.min(c + 3, gridWidth),
              maxY = Math.min(r + 3, gridHeight)
        for(r = minY; r < maxY; r++)
            for(c = minX; c < maxX; c++){
                let sample = grid[r * gridWidth + c]
                if(!sample) continue
                let dx = sample[0] - x,
                    dy = sample[1] - y
                if(dx * dx + dy * dy < radiusSquared)
                    return false
            }
        return true
    }
    
    function Sample(x, y){
        const sample = [ x, y ]
        queue.push(sample)
        
        grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = sample
        
        sampleSize++
        return sample
    }
    
    return function(){
        if(!sampleSize) return Sample(rng() * width, rng() * height)
        while(queue.length){
            const index = rng() * queue.length | 0,
                  sample = queue[index]
            
            for(let i = 0; i < maxIterations; i++){
                const angle = rng() * 2 * Math.PI,
                      radius = Math.sqrt(rng() * outerRadius + radiusSquared),
                      x = sample[0] + radius * Math.cos(angle),
                      y = sample[1] + radius * Math.sin(angle)
                if(0 <= x && x < width && 0 <= y && y < height && far(x, y))
                    return Sample(x, y)
            }
            
            queue[index] = queue.pop()
        }
    }
}
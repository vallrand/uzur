export const distanceComparator = (a, b) => {
    let dx = a.x - b.x,
        dy = a.y - b.y,
        r2 = a.radius + b.radius
    return dx*dx + dy*dy < r2*r2
}

export const BruteForce = (comparator, items, resolver) => {
    for(let a = items.length - 1; a >= 0; a--)
        for(let itemA = items[a], b = a - 1; b >= 0; b--){
            let itemB = items[b]
            if(comparator(itemA, itemB))
                resolver(itemA, itemB)
        }
}

export const HashGrid = ({ width, height, cellWidth, cellHeight }) => {
    const rows = Math.ceil(width / cellWidth),
          cols = Math.ceil(height / cellHeight),
          grid = Array.range(rows * cols).map(i => [])
    
    return (comparator, items, resolver) => {
        for(let i = grid.length - 1; i >= 0; grid[i--].length = 0);
        
        for(let i = items.length - 1; i >= 0; i--){
            let item = items[i],
                radius = item.radius || 0,
                xmin = Math.max(0, ((item.x - radius) / cellWidth) << 0),
                xmax = Math.min(rows - 1, ((item.x + radius) / cellWidth) << 0),
                ymin = Math.max(0, ((item.y - radius) / cellHeight) << 0),
                ymax = Math.min(cols - 1, ((item.y + radius) / cellHeight) << 0)
            
            for(let y = ymin; y <= ymax; y++)
                for(let x = xmin; x <= xmax; x++)
                    grid[y * rows + x].push(i)
        }
        
        const collisionMap = [],
              indexComparator = (a, b) => {
                  const key = (a << 16) + b
                  if(collisionMap[key]) return false
                  return comparator(items[a], items[b]) && (collisionMap[key] = true)
              },
              indexResolver = (a, b) => resolver(items[a], items[b])
        for(let i = grid.length - 1; i >= 0; i--){
            let subItems = grid[i]
            if(!subItems.length) continue
            BruteForce(indexComparator, subItems, indexResolver)
        }
        
    }
}
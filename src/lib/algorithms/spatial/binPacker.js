export const sort = {
    area: (a, b) => b.width * b.height - a.width * a.height,
    max: (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
    width: (a, b) => b.width - a.width || b.height - a.height,
    height: (a, b) => b.height - a.height || b.width - a.width
}
    
export const binpack = (items, sorting = sort.area) => {
    let root = null
    
    const findNode = (root, width, height) => root.used
        ? findNode(root.right, width, height) || findNode(root.down, width, height)
        : width <= root.width && height <= root.height && root || null

    const splitNode = (node, width, height) => Object.assign(node, {
        used: true,
        down: {
            x: node.x,
            y: node.y + height,
            width: node.width,
            height: node.height - height
        },
        right: {
            x: node.x + width,
            y: node.y,
            width: node.width - width,
            height: height
        }
    })
    
    const growNode = (width, height) => {
        if(width > root.width && height > root.height) return null
        root = height > root.height || (root.width >= root.height + height) > (root.height >= root.width + width) ? {
            used: true,
            x: 0, y: 0,
            width: root.width,
            height: root.height + height,
            down: { x: 0, y: root.height, width: root.width, height: height },
            right: root
        } : {
            used: true,
            x: 0, y: 0,
            width: root.width + width,
            height: root.height,
            down: root,
            right: { x: root.width, y: 0, width: width, height: root.height }
        }
        const node = findNode(root, width, height)
        return node && splitNode(node, width, height)
    }
    
    const packed = items.slice().sort(sorting).map(item => {
        const { width, height } = item
        if(!root) root = { x: 0, y: 0, width, height }
        
        const node = findNode(root, width, height)
        const fit = node ? splitNode(node, width, height) : growNode(width, height)
        
        return {
            width, height, item,
            x: fit.x,
            y: fit.y
        }
    })
    
    const [ width, height ] = packed.reduce(([ left, top ], { x, y, width, height }) => [
        Math.max(left, x + width),
        Math.max(top, y + height)
    ], [0, 0])
    
    return { width, height, packed }
}
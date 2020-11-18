import Stats from 'stats.js'
var stats = new Stats()
document.body.appendChild(stats.dom)
requestAnimationFrame(function loop(){
    stats.update()
    requestAnimationFrame(loop)
})

export default (canvas, stage, { lineWidth = 1, color = '#ffffff' } = {}) => {
    const overlayCanvas = document.createElement('canvas'),
          ctx = overlayCanvas.getContext('2d', { alpha: true })
    overlayCanvas.style.setProperty('position', 'fixed')
    overlayCanvas.style.setProperty('left', 0)
    overlayCanvas.style.setProperty('top', 0)
    document.body.appendChild(overlayCanvas)
    
    function resize(){
        overlayCanvas.width = canvas.width
        overlayCanvas.height = canvas.height
        overlayCanvas.style.width = canvas.style.width
        overlayCanvas.style.height = canvas.style.height
    }
    resize()
    
    function render(){
        const { width, height } = overlayCanvas
        
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, width, height)
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = lineWidth
        
        ctx.setTransform(1, 0, 0, 1, 0.5 * width, 0.5 * height)
        
        for(let i = stage.entities.length - 1; i >= 0; i--){
            let entity = stage.entities[i]
            if(!entity.vertexData) continue
            
            ctx.beginPath()
            ctx.moveTo(entity.vertexData[0], entity.vertexData[1])
            ctx.lineTo(entity.vertexData[2], entity.vertexData[3])
            ctx.lineTo(entity.vertexData[4], entity.vertexData[5])
            ctx.lineTo(entity.vertexData[6], entity.vertexData[7])
            ctx.lineTo(entity.vertexData[0], entity.vertexData[1])
            ctx.stroke()
            
            let left = entity.vertexData[0]
            let top = entity.vertexData[1]
            
            let centerX = left + entity.pivotX * (entity.vertexData[2] - left) + entity.pivotY * (entity.vertexData[6] - left)
            let centerY = top + entity.pivotX * (entity.vertexData[3] - top) + entity.pivotY * (entity.vertexData[7] - top)
            
            ctx.fillRect(centerX - lineWidth, centerY - lineWidth, 2 * lineWidth, 2 * lineWidth)
        }
    }
    
    requestAnimationFrame(function loop(){
        render()
        requestAnimationFrame(loop)
    })
}
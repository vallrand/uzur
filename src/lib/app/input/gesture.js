window.addEventListener('contextmenu', event => event.preventDefault(), false)

export const Gesture = (element, {
    enter,
    move,
    release
}) => {
    element.style.pointerEvents = 'all'
    
    const onEnter = (x, y) => enter && enter(
        (x - element.offsetLeft) / element.offsetWidth,
        (y - element.offsetTop) / element.offsetHeight,
        element.offsetWidth / element.offsetHeight
    )
    const onMove = (x, y) => move && move(
        (x - element.offsetLeft) / element.offsetWidth,
        (y - element.offsetTop) / element.offsetHeight,
        element.offsetWidth / element.offsetHeight
    )
    const onRelease = () => release && release()
    
    let touchIndex = null    
    element.addEventListener('touchstart', function onTouchStart(event){
        if(!event.touches || touchIndex != null) return
        
        const touch	= event.changedTouches[0]
        
        if(onEnter(touch.pageX, touch.pageY) === false) return
        touchIndex = touch.identifier
        
        event.preventDefault()
        event.stopPropagation()
    }, false)
    element.addEventListener('touchmove', function onTouchMove(event){
        const touch = Array.prototype.slice.call(event.changedTouches)
        .find(touch => touch.identifier === touchIndex)
        if(!touch) return
        onMove(touch.pageX, touch.pageY)
        
        event.preventDefault()
        event.stopPropagation()
    }, false)
    element.addEventListener('touchend', function onTouchEnd(event){
        const touch = Array.prototype.slice.call(event.changedTouches)
        .find(touch => touch.identifier === touchIndex)
        if(!touch) return
        touchIndex = null
        onRelease()
        
        event.preventDefault()
        event.stopPropagation()
    }, false)
    element.addEventListener('touchcancel', function onTouchCancel(event){
        if(touchIndex != null) onRelease()
        touchIndex = null
    }, false)
    
    
    function onMouseMove(event){
        onMove(event.clientX, event.clientY)
        
        event.preventDefault()
        event.stopPropagation()
    }
    function onMouseUp(event){
        onRelease()
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        
        event.preventDefault()
        event.stopPropagation()
    }
    element.addEventListener('mousedown', function onMouseDown(event){
        if(onEnter(event.clientX, event.clientY) === false) return
        window.addEventListener('mousemove', onMouseMove, false)
        window.addEventListener('mouseup', onMouseUp, false)
        
        event.preventDefault()
        event.stopPropagation()
    }, false)
    
    
    function clear(){
        element.removeEventListener('touchstart', onTouchStart)
        element.removeEventListener('touchmove', onTouchMove)
        element.removeEventListener('touchend', onTouchEnd)
        element.removeEventListener('touchcancel', onTouchCancel)
        
        element.removeEventListener('mousedown', onMouseDown)
        
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
    }
    return { clear }
}
export default (gl, state) => {
        
    const blendModes = {
        blend: _ => gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA),
        add: _ => gl.blendFunc(gl.SRC_ALPHA, gl.ONE),
        blend_add: _ => gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA) //TODO premultiply source alpha with rgb in shader (rgb * a)
    }
    
    return {
        set mode(value){
            if(!value){
                if(state.set('blend', false)) gl.disable(gl.BLEND)
            }else{
                if(state.set('blend', true)) gl.enable(gl.BLEND)
                if(state.set('blendMode', value)) blendModes[value]()
            }
        },
        get mode(){
            return state['blend'] && state['blendMode']
        }
    }
}
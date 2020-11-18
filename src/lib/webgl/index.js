import { combine } from '../util'
import { mat3, mat3x2, vec4 } from '../math'

import Texture from './texture'
import VertexBufferObject from './vbo'
import VertexArrayObject from './vao'
import Shader from './shader'
import FrameBufferObject from './fbo'
import RenderTarget from './rt'
import ProgramComposer from './programs'
import BlendModes from './blending'
import Extensions from './extensions'

export default () => {
    const options = {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
    }
	const canvas = document.createElement('canvas')
	const gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options)
    const state = {
        framebuffers: [],
        extensions: Extensions(gl),
        set: (location, value) => {
            if(state[location] === value) return false
            state[location] = value
            return true
        }
    }
    const programs = Object.create(null),
          renderTargetManager = {
              root: RenderTarget(gl, state)(),
              bound: null,
              switchContext: renderTarget => 
                  renderTargetManager.bound = renderTarget && renderTarget.bind().clear()
          }
    
	const ctx = {
		canvas, gl, state, 
        get renderTarget(){ return renderTargetManager.bound || renderTargetManager.root },
        get rootRenderTarget(){ return renderTargetManager.root },
        resize: (width, height, dpr = 1) => {
            if(!state.set('resolution', `${width}x${height}`)) return false
            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            renderTargetManager.root.resize(canvas.width, canvas.height)            
        },
        Texture: Texture(gl, state),
        Shader: Shader(gl, state),
        Buffer: VertexBufferObject(gl, state),
        VAO: VertexArrayObject(gl, state),
        FBO: FrameBufferObject(gl, state),
        RenderTarget: RenderTarget(gl, state),
        render: ProgramComposer(programs, renderTargetManager),
        blend: BlendModes(gl, state),
        registerProgram: (name, program) => (programs[name] = program(ctx), ctx)
	}
    canvas.addEventListener('webglcontextlost', event => event.preventDefault(), false)
    return ctx
}
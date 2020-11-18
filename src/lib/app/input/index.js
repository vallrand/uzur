import { combine } from '../../util'
import { Keyboard } from './keyboard'
import { VirtualJoystick } from './joystick'
import { Button } from './pad'

const RadialUIElement = ({ size, icon = '' }) => {
    const element = document.createElement('div')
    Object.assign(element.style, {
        position: 'absolute',
        borderRadius: '100%',
        textAlign: 'center',
        width: `${16 * size}vmin`,
        height: `${16 * size}vmin`,
        transform: 'translate(-50%, -50%)',
        boxShadow: 'inset 0 0 16px 4px #ffffff, 0 0 8px 0px #ffffff',
        fontSize: `${8 * size}vmin`,
        color: '#ffffff',
        lineHeight: `${16 * size}vmin`
    })
    element.innerText = icon
    
    return {
        dom: element,
        set position(value){
            element.style.display = value ? '' : 'none'
            if(!value) return
            const [ x, y ] = value
            element.style.left = `${1e2 * x}%`
            element.style.top = `${1e2 * y}%`
        },
        set state(value){
            element.style.backgroundColor = value ? 'rgba(255,255,255,0.75)' : 'transparent'
        }
    }
}

export default canvas => stage => combine(stage, {
    input: {
        touchControls: 'touchstart' in document.documentElement,
        keys: Keyboard().keys,
        Joystick: ({ position, size = 1 }) => {
            const baseElement = RadialUIElement({ size: size })
            const stickElement = RadialUIElement({ size: 0.75 * size })
            stage.overlay.appendChild(baseElement.dom)
            stage.overlay.appendChild(stickElement.dom)
            return VirtualJoystick({
                element: stage.overlay,
                position,
                radius: 0.1,
                visual: {
                    set origin(value){ baseElement.position = value },
                    set target(value){ stickElement.position = value }
                }
            })
        },
        Button: ({ position, size = 1, icon }) => {
            const buttonElement = RadialUIElement({ icon, size: 0.75 * size })
            stage.overlay.appendChild(buttonElement.dom)
            return Button({
                element: buttonElement.dom,
                position,
                visual: {
                    set target(value){ buttonElement.position = value },
                    set pressed(value){ buttonElement.state = value }
                }
            })
        }
    }
})
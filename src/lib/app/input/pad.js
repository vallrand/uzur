import { vec2 } from '../../math'
import { Gesture } from './gesture'

export const Button = ({
    element,
    visual,
    position
}) => {
    visual.target = position
    const state = {
        value: false
    }
    Gesture(element, {
        enter: () => state.value = visual.pressed = true,
        release: () => state.value = visual.pressed = false
    })
    return state
}
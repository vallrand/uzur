export const Keyboard = () => {
    const keys = Object.create(null)
    document.addEventListener('keydown', event => keys[event.key] = true, false)
    document.addEventListener('keyup', event =>	keys[event.key] = false, false)
    return { keys }
}
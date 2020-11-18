export const Controls = (system, stage) => {       
    const { input: { keys } } = stage
    
    const mobileUI = 'mobile' in location.query ? !!location.query['mobile'] : stage.input.touchControls
    const panel = mobileUI ? {
        action: stage.input.Button({ position: [ 0.15, 0.9 ], size: 1, icon: 'ᐃ' }),
        toggle: stage.input.Button({ position: [ 0.05, 0.8 ], size: 0.75, icon: '∿' }),
        direction: stage.input.Joystick({ position: [ 0.9, 0.9 ] })
    } : { action: {}, toggle: {}, direction: {} }
    
    if(!mobileUI){
        const instructions = document.createElement('div')
        Object.assign(instructions.style, {
            color: '#6a6a6a',
            position: 'absolute',
            top: '100%',
            zIndex: 8,
            width: '100%'
        })
        instructions.innerText = `WASD / Arrow Keys to Move \n Spacebar to Fire / Select \n E to switch Weapon`
        stage.overlay.appendChild(instructions)
    }

    Object.assign(system, {
        input: {
            get toggle(){ return keys['e'] || panel.toggle.value },
            set toggle(value){ keys['e'] = panel.toggle.value = value },
            
            get action(){ return keys[' '] || panel.action.value },
            set action(value){ keys[' '] = panel.action.value = value },
            
            get left(){ return keys['a'] || keys['ArrowLeft'] || panel.direction.left },
            set left(value){ keys['a'] = keys['ArrowLeft'] = panel.direction.left = value },
            
            get right(){ return keys['d'] || keys['ArrowRight'] || panel.direction.right },
            set right(value){ keys['d'] = keys['ArrowRight'] = panel.direction.right = value },
            
            get up(){ return keys['w'] || keys['ArrowUp'] || panel.direction.up },
            set up(value){ keys['w'] = keys['ArrowUp'] = panel.direction.up = value },
            
            get down(){ return keys['s'] || keys['ArrowDown'] || panel.direction.down },
            set down(value){ keys['s'] = keys['ArrowDown'] = panel.direction.down = value }
        }
    })
}
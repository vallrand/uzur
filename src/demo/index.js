import { SystemManager, Factory } from '../lib/app/framework'
//import Debug from './debug'

import {
    Spatial,
    Auditory,
    Controls,
    Layers,
    
    Panorama,
    Overworld
} from './systems'

import { starfield, planet } from './definitions/space'
import { critters } from './definitions/critters'
import { environment } from './definitions/environment'
import { background, foreground, controller } from './definitions'

export default stage => {
    const systemManager = SystemManager(stage, [
        Factory({
            starfield,
            planet,
            ...critters,
            ...environment,
            background,
            foreground,
            controller
        }),
        Spatial,
        Auditory,
        Controls,
        Layers,
        
        Panorama,
        Overworld
    ])
    
    const seed = +location.query.seed || Math.randomInt(0, 1e6)
    console.log(`Seed: %c${seed}`, 'color: #0000aa')
    Math.random.reseed(seed)
    
    console.log('system', window.system = systemManager)
    //Debug(webgl.canvas, stage, { lineWidth: 2, color: 'rgba(255, 0, 0, 0.5)' }) //TODO check for debug flags in url query
    
    const play = () => systemManager.dispatch('overview', {})
    .then(payload => systemManager.dispatch('establish', payload))
    .then(play)
    
    systemManager.dispatch('initialize').then(play)
}
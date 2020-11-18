import { clock, combine } from '../util'
import WGL from '../webgl'
import WAD from '../webaudio'
import store from './store'
import StageManager from './stage'
import ScreenHandler from './screen'
import OverlayDisplay from './overlay'
import SoundMixer from './mixer'
import InputHandler from './input'
import PrerenderEngine from './prerender'
import {
    bitmapFactory,
    meshFactory,
    sphereFactory,
    curveFactory,
    trailFactory,
    planeFactory,
    layerFactory,
    
    channelFactory,
    soundFactory
} from './components'
import {
    parser,
    detectResourceType,
    parseImageData,
    parseAudioData,
    parseTextureAtlas,
    parseSoundSprite
} from './parsers'

import {
    batchedProgram,
    meshProgram,
    sphereProgram,
    curveProgram,
    trailProgram,
    planeProgram,
    layerProgram
} from '../webgl/programs'

import {
    dissolveFilter,
    dissipateFilter,
    thresholdFilter,
    glareFilter,
    colorFilter,
    chromaticAbberationFilter,
    shockwaveFilter
} from '../webgl/programs/filters'

export default (resources, app) => {
    const webgl = WGL()
    .registerProgram('bitmap', batchedProgram)
    .registerProgram('mesh', meshProgram)
    .registerProgram('sphere', sphereProgram)
    .registerProgram('curve', curveProgram)
    .registerProgram('trail', trailProgram)
    .registerProgram('plane', planeProgram)
    .registerProgram('layer', layerProgram({
        dissolve: dissolveFilter,
        dissipate: dissipateFilter,
        threshold: thresholdFilter,
        glare: glareFilter,
        color: colorFilter,
        chromaticAbberation: chromaticAbberationFilter,
        shockwave: shockwaveFilter
    }))
    const webaudio = WAD()
    
    return parser(store, [
        detectResourceType,
        parseImageData(webgl),
        parseAudioData(webaudio),
        parseTextureAtlas,
        parseSoundSprite
    ])(resources).then(cache => {
        const stage = [
            StageManager({
                bitmap: bitmapFactory(store),
                mesh: meshFactory(store),
                sphere: sphereFactory(store),
                curve: curveFactory(store),
                trail: trailFactory(store),
                plane: planeFactory(store),
                layer: layerFactory(store),
                
                channel: channelFactory(store, webaudio),
                sound: soundFactory(store, webaudio)
            }),
            ScreenHandler(webgl),
            OverlayDisplay(webgl.canvas),
            SoundMixer(webaudio),
            PrerenderEngine(store, webgl),
            InputHandler(webgl.canvas)
        ].reduce((stage, decorate) => decorate(stage))
        document.body.appendChild(webgl.canvas)
        
        console.log('store', window.store = store)
        console.log('webgl', window.webgl = webgl)
        console.log('webaudio', window.webaudio = webaudio)
        console.log('stage', window.stage = stage)
        
        app(stage)

        clock.listen(deltaTime => webgl.render(stage.layers))
    }).catch(console.error)
}
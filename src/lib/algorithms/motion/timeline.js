import { terminate } from '../../util'

export const DelayEvent = (delay, callback) => {
    let time = 0
    return deltaTime => (time += deltaTime) < delay || (callback(time - delay), terminate)
}

export const RepeatEvent = (interval, callback) => {
    let timeRemaining = interval,
        counter = 0
    return deltaTime => (timeRemaining -= deltaTime) > 0 || callback(interval - (timeRemaining += interval), counter++)
}

export const Timeline = (frames, { framesPerSecond = 30, loop = false } = {}) =>
    (target, callback) => {
        let time = 0,
            frame = 0
        target.texture = frames[0]
        
        return deltaTime => {
            time += deltaTime
            frame = framesPerSecond * time | 0
            if(frame >= frames.length && !loop)
                return callback && callback(), terminate
            target.texture = frames[frame % frames.length]
        }
    }

export const EventTimeline = frameHandler =>
    frames => {
        frames.sort((a, b) => a.time - b.time)
        let frameIdx = -1,
            timeScale = 1,
            time = 0
        return deltaTime => {
            if(!timeScale) return
            time += deltaTime * timeScale
            for(let wait, length = frames.length - 1; frameIdx < length; frameIdx++){
                if(wait instanceof Promise)
                    return timeScale = 0, wait.then(() => timeScale = 1)
                
                let nextFrame = frames[frameIdx + 1]
                if(nextFrame.time > time) return
                wait = frameHandler(nextFrame, time - nextFrame.time)
            }
            return frameHandler(), terminate
        }
    }
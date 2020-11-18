import { terminate } from '../../util'

export const Tween = ({
    target,
    duration = 0,
    delay = 0,
    ease,
    end, update,
    ...values
}) => {
    const properties = Object.keys(values)
    .map(property => Array.isArray(values[property])
         ? [ property, ...values[property] ]
         : [ property, target[property], values[property] ])
    let time = -delay
    return deltaTime => {
        time += deltaTime
        let factor = Math.clamp(time / duration, 0, 1)
        for(let i = properties.length - 1; i >= 0; i--){
            let [ property, startValue, endValue ] = properties[i]
            target[property] = Math.lerp(startValue, endValue, ease ? ease(factor) : factor)
        }
        update && update(factor, time, deltaTime)
        if(time >= duration)
            return end && end(), terminate
    }
}

export const ease = {
    fade: x => 4 * x * (1-x),
    sine: x => 0.5 + 0.5 * Math.cos(2 * Math.PI * x - Math.PI),
    circle: x => Math.sqrt(1 - Math.pow(2 * x - 1, 2)),
	split: (value, startEase, endEase) => x => x < value ? startEase(x / value) : endEase((x - value) / (1 - value)),
    powerIn: power => x => Math.pow(x, power),
    powerOut: power => x => 1 - Math.pow(1 - x, power),
    powerInOut: power => x => x < 0.5 ? 0.5 * Math.pow(2 * x, power) : 1 - 0.5 * Math.pow(2 * (1 - x), power),
    linearGradient: values => x => {
        let index = Math.floor(x * (values.length - 1)),
            factor = x * (values.length - 1) % 1,
            prev = values[index++],
            next = index < values.length ? values[index] : prev
        return Math.lerp(prev, next, factor)
    },
    slide: steepness => {
        steepness = Math.min(1, steepness)
        const localMaximum = steepness / (steepness + 1)
        const amplitude = 1 / (Math.pow(localMaximum, steepness) - Math.pow(localMaximum, steepness + 1))
        return x => amplitude * (Math.pow(x, steepness) - Math.pow(x, steepness + 1))
    },
    curve: displacement => x => (1+displacement) * x / (x + displacement)
}

export const MotionMixer = tracks => {
    const trackKeys = Object.keys(tracks),
          valueKeys = trackKeys.map(track => Object.keys(tracks[track])).flatten().unique(),
          values = []
    return (weights, payload) => {
        const total = trackKeys.reduce((total, track) => total + weights[track], 0)
        for(let i = valueKeys.length - 1; i >= 0; values[valueKeys[i--]] = 0);
        if(!total) return values
        
        for(let i = trackKeys.length - 1; i >= 0; i--){
            let track = trackKeys[i],
                weight = weights[track] / total
            if(!weight) continue
            for(let j = valueKeys.length - 1; j >= 0; j--){
                let key = valueKeys[j],
                    tween = tracks[track][key]
                if(!tween) continue
                values[key] += weight * tween(payload)
            }
        }
        return values
    }
}
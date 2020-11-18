export const Auditory = (system, stage) => ({
    ['initialize']: () => {
        stage.mixer.volume = 'volume' in location.query ? parseFloat(location.query['volume']) : 1
        system.channels = {
            sfx: stage.mixer.create({
                type: 'channel',
                volume: 1,
				compressor: {
					threshold: -24,
					knee: 30,
					ratio: 12,
					attack: 0.003,
					release: 0.25
				}
            }),
            music: stage.mixer.create({
                type: 'channel',
                volume: 1
            })
        }
		
        let timeElapsed = 0
        system.procedure(deltaTime => {
            timeElapsed += deltaTime
        })
        
        system.playSequentialSound = ({ track, volume, ...options }) => {
			//TODO: Use Compressor instead
            //const overallVolume = system.channels.sfx.entities
            //.filter(entity => entity.track === track)
            //.map(entity => entity.volume * Math.exp(entity.startTime - timeElapsed))
            //.reduce((total, volume) => total + volume, 0)
			//volume *= Math.max(0, 1 - overallVolume)
            
            system.channels.sfx.create({
                type: 'sound',
                track,
                startTime: timeElapsed,
                volume: volume,
                ...options
            }).play()
        }
    }
})
import { storeAudioForNextOpening } from '../misc/helper.js';

// play
export const play = async (playbackObj, uri, lastPosition) => {
    try {

        if (!lastPosition) return await playbackObj.loadAsync({ uri }, { shouldPlay: true, progressUpdateIntervalMillis: 1000})
        
        await playbackObj.loadAsync(
            {uri},
            {progressUpdateIntervalMillis: 1000}
        )

        return await playbackObj.playFromPositionAsync(lastPosition)
    } catch (error) {
        console.log('error playing audio', error.message)
    }
}
// pause
export const pause = async (playbackObj) => {
    try {
        const status = await playbackObj.setStatusAsync({
            shouldPlay: false 
        })
        return status
    } catch (error) {
        console.log('error pause audio', error.message)
    }
}
// resume
export const resume = async (playbackObj) => {
    try {
        return await playbackObj.playAsync()
    } catch (error) {
        console.log('error resume audio', error.message)
    }
}
// select another audio
export const playNext = async (playbackObj, uri) => {
    try {
        await playbackObj.stopAsync()
        await playbackObj.unloadAsync()
        return await play(playbackObj, uri)
    } catch (error) {
        console.log('error select another audio', error.message)
    }
}

export const selectAudio = async (audio, context, playlistInfo = {}) => {
    const {soundObj, playbackObj, currentAudio, updateState, audioFiles, onPlaybackStatusUpdate} = context

    try {
        //play
        if (soundObj === null) {
            const status = await play(playbackObj, audio.uri, audio.lastPosition)
            const index = audioFiles.findIndex(({id}) => id === audio.id)
            console.log('audio is playing')
            updateState(context, {currentAudio: audio, soundObj: status, isPlaying: true, currentAudioIndex: index, isPlaylistRunning: false, activePlaylist: [], ...playlistInfo})
            playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
            return storeAudioForNextOpening(audio, index)
        }
        
        if (soundObj.isLoaded && soundObj.isPlaying && currentAudio.id === audio.id) {
            const status = await pause(playbackObj)
            console.log('audio is paused')
            return updateState(context, {soundObj: status, isPlaying: false})
        }

        if (
            soundObj.isLoaded &&
            !soundObj.isPlaying &&
            currentAudio.id === audio.id
        ) {
            //const status = this.state.playbackObj.playAsync()
            const status = await resume(playbackObj)
            console.log('audio is resumed')
            return updateState(context, {soundObj: status, isPlaying: true})
        }

        if (
            soundObj.isLoaded &&
            currentAudio.id !== audio.id
        ) {
            const status = await playNext(playbackObj, audio.uri)
            const index = audioFiles.findIndex(({id}) => id === audio.id)
            updateState(context, {currentAudio: audio, soundObj: status, isPlaying: true, currentAudioIndex: index, isPlaylistRunning: false, activePlaylist: [], ...playlistInfo})
            return storeAudioForNextOpening(audio, index)
        }
    } catch (error) {
        console.log('error inside select audio method.', error.message)
    }
    
}

const selectAudioFromPlaylist = async (context, select) => {
    const {activePlaylist, currentAudio, audioFiles, playbackObj, updateState} = context
    let audio
    let defaultIndex
    let nextIndex
    const indexOnPlaylist = activePlaylist.audios.findIndex(({id}) => id === currentAudio.id)
    
    if (select === 'next') {
        nextIndex = indexOnPlaylist + 1
        defaultIndex = 0
    }

    if (select === 'previous') {
        nextIndex = indexOnPlaylist - 1
        defaultIndex = activePlaylist.audios.length - 1
    }

    audio = activePlaylist.audios[nextIndex]

    if (!audio) audio = activePlaylist.audios[defaultIndex]

    const indexOnAllList = audioFiles.findIndex(({id}) => id === audio.id)
    const status = await playNext(playbackObj, audio.uri)
    
    return updateState(context, {
        soundObj: status,
        isPlaying: true,
        currentAudio: audio,
        currentAudioIndex: indexOnAllList
    })
}

export const changeAudio = async (context, select) => {
    const {playbackObj, currentAudioIndex, totalAudioCount, audioFiles, updateState, onPlaybackStatusUpdate, isPlaylistRunning} = context
    
    if (isPlaylistRunning) return selectAudioFromPlaylist(context, select)

    try {
        const {isLoaded} = await playbackObj.getStatusAsync()
        const isLastAudio = currentAudioIndex + 1 === totalAudioCount
        const isFirstAudio = currentAudioIndex <= 0
        let audio
        let index
        let status

        // for next
        if (select === 'next') {
            audio = audioFiles[currentAudioIndex + 1]
            if (!isLoaded && !isLastAudio) {
                index = currentAudioIndex + 1
                status = await play(playbackObj, audio.uri)
                playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
            }
    
            if (isLoaded && !isLastAudio) {
                index = currentAudioIndex + 1
                status = await playNext(playbackObj, audio.uri)
            }
    
            if (isLastAudio) {
                index = 0
                audio = audioFiles[index]
                if (isLoaded)
                    status = await playNext(playbackObj, audio.uri)
                else
                    status = await play(playbackObj, audio.uri)
            }
        }
        // for previous
        if (select === 'previous') {
            audio = audioFiles[currentAudioIndex - 1]
            if (!isLoaded && !isFirstAudio) {
                index = currentAudioIndex - 1
                status = await play(playbackObj, audio.uri)
                playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)

            }

            if (isLoaded && !isFirstAudio) {
                index = currentAudioIndex - 1
                status = await playNext(playbackObj, audio.uri)
            }

            if (isFirstAudio) {
                index = totalAudioCount - 1
                audio = audioFiles[index]
                if (isLoaded)
                    status = await playNext(playbackObj, audio.uri)
                else
                    status = await play(playbackObj, audio.uri)
            }
        }
        

        updateState(context, {
            currentAudio: audio,
            soundObj: status,
            isPlaying: true,
            currentAudioIndex: index,   
            playbackPosition: null,
            playbackDuration: null
        })
        storeAudioForNextOpening(audio, index)
    } catch (error) {
        console.log('error inside changeAudio method', error.message)
    }
    
}
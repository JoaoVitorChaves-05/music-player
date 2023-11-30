import React, { Component, createContext } from 'react'
import {Text, View, Alert} from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import {DataProvider} from 'recyclerlistview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Audio} from 'expo-av'
import { playNext } from '../misc/audioController'
import { storeAudioForNextOpening } from'../misc/helper'
import * as FileSystem from 'expo-file-system'
import {
    AdMobRewarded
} from 'expo-ads-admob';


async function loadAd() {
    await AdMobRewarded.setAdUnitID('ca-app-pub-2088794319704540/2097153565')
    await AdMobRewarded.requestAdAsync()
}

export const AudioContext = createContext()
class AudioProvider extends Component {
    constructor(props) {
        super(props)
        this.state = {
            audioFiles: [],
            playlist: [],
            addToPlaylist: null,
            permissionError: false,
            dataProvider: new DataProvider((r1, r2) => r1 !== r2),
            playbackObj: null,
            soundObj: null,
            currentAudio: {},
            currentAudioIndex: null,
            isPlaying: false,
            isPlaylistRunning: false,
            activePlaylist: [],
            playbackPosition: null,
            playbackDuration: null,
            isAlreadyDownloading: false,
            musicsToDownload: [],
            thisIsNewOpen: true,
            downloadProgress: 0,
        }
        this.totalAudioCount = 0
    }

    checkMusicToDownload = ({title, url}) => {
        if (this.state.thisIsNewOpen) {
            Alert.alert(
                "Download",
                "To download musics you need watch a video.",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log('exited')
                    },
                    {
                        text: "Ok",
                        onPress: async () => {
                            await AdMobRewarded.showAdAsync();
                            this.state.thisIsNewOpen = false
                        }
                    }
                ]
            )
        }

        const {musicsToDownload} = this.state
        for (let i = 0; i < musicsToDownload.length; i++) {
            if (title === musicsToDownload[i].title) {
                return false
            }
        }
        musicsToDownload.push({title: title, url: url})
        console.log(`Música ${title} adicionada para download`)
        return true
    }

    saveFile = async (fileUri) => {
        const asset = await MediaLibrary.createAssetAsync(fileUri)        
    }

    downloadMusic = async () => {
        if (this.state.musicsToDownload.length > 0) {
            //sendPushNotification(this.state.expoPushToken)
            // res.header("Content-Disposition", "attachment; filename=" + title + ".mp3")
            const {title, url} = this.state.musicsToDownload[0]
            
            FileSystem.downloadAsync(
                `${url}`,
                FileSystem.documentDirectory + title + '.mp3'
            ).then(async ({ uri }) => {
                await this.saveFile(uri)
                console.log('Finished downloading to ', uri);
                this.updateAudioFiles()
                this.setState({...this.state, musicsToDownload: this.state.musicsToDownload.filter(item => item.title !== title)},
                () => {
                    //console.log(this.state.musicsToDownload)
                    console.log('Finished downloading: ', title)
                    this.setState({...this.state, isAlreadyDownloading: false})
                    this.downloadMusic()
                })
            }).catch(error => {
                console.error(error);
            });
        }
    }

    permissionAlert = () => {
        Alert.alert("Permission Required", "This app needs to read audio files!", [
            {
                text: 'I am ready',
                onPress: () => this.getPermission()
            },
            {
                text: 'cancel',
                onPress: () => this.permissionAlert()
            }
        ])
    }

    getAudioFiles = async () => {
        const {dataProvider, audioFiles} = this.state
        
        let media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
        })

        media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: media.totalCount,
        })
        console.log(Object.keys(media))

        

        media.assets = media.assets.sort((a, b) => a.filename > b.filename)
        media.assets = media.assets.filter((audio) => {
            console.log(audio.filename)
            return audio.filename.split('.')[audio.filename.split('.').length - 1] === 'mp3'
        })
        media.totalCount = media.assets.length
        this.totalAudioCount = media.totalCount

        this.setState({
            ...this.state, 
            dataProvider: dataProvider.cloneWithRows([
                ...audioFiles, 
                ...media.assets
            ]), 
            audioFiles: [...audioFiles, ...media.assets]
        })

        console.log(this.state.audioFiles.length)
    }

    updateAudioFiles = async () => {
        this.state.dataProvider = new DataProvider((r1, r2) => r1 !== r2)
        this.state.audioFiles = []
        this.getAudioFiles()
    }

    loadPreviousAudio = async () => {
        let previousAudio = await AsyncStorage.getItem('previousAudio')
        let currentAudio
        let currentAudioIndex

        if (previousAudio === null) {
            currentAudio = this.state.audioFiles[0]
            currentAudioIndex = 0
        } else {
            previousAudio = JSON.parse(previousAudio)
            currentAudio = previousAudio.audio
            currentAudioIndex = previousAudio.index
        }

        this.setState({...this.state, currentAudio, currentAudioIndex})
    }

    getPermission = async () => {
        const permission = await MediaLibrary.getPermissionsAsync()
        if (permission.granted) {
            this.getAudioFiles()
        }

        if (!permission.canAskAgain && !permission.granted) {
            this.setState({...this.state, permissionError: true})
        }

        if (!permission.granted && permission.canAskAgain) {
            const {status, canAskAgain} = await MediaLibrary.requestPermissionsAsync()
            if (status === 'denied' && canAskAgain) {
                this.permissionAlert()
            }

            if (status === 'granted') {
                this.getAudioFiles()
            }

            if (status === 'denied' && !canAskAgain) {
                this.setState({ ...this.state, permissionError: true })
            }
        }
    }

    onPlaybackStatusUpdate = async (playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
            this.updateState(this, {
                playbackPosition: playbackStatus.positionMillis,
                playbackDuration: playbackStatus.durationMillis
            })
        }

        if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
            storeAudioForNextOpening(this.state.currentAudio, this.state.currentAudioIndex, playbackStatus.positionMillis)
        }

        if (playbackStatus.didJustFinish) {
            if (this.state.isPlaylistRunning) {
                let audio
                const indexOnPlaylist = this.state.activePlaylist.audios.findIndex(({id}) => id === this.state.currentAudio.id)
                const nextIndex = indexOnPlaylist + 1
                audio = this.state.activePlaylist.audios[nextIndex]

                if (!audio) audio = this.state.activePlaylist.audios[0]

                const indexOnAllList = this.state.audioFiles.findIndex(({id}) => id === audio.id)
                const status = await playNext(this.state.playbackObj, audio.uri)
                
                return this.updateState(this, {
                    soundObj: status,
                    isPlaying: true,
                    currentAudio: audio,
                    currentAudioIndex: indexOnAllList
                })
            }
            const nextAudioIndex = this.state.currentAudioIndex + 1
            if(nextAudioIndex >= this.totalAudioCount) {
                this.state.playbackObj.unloadAsync()
                this.updateState(this, {
                    soundObj: null,
                    currentAudio: this.state.audioFiles[0],
                    isPlaying: false, 
                    currentAudioIndex: 0,
                    playbackPosition: null,
                    playbackDuration: null
                })
                return await storeAudioForNextOpening(this.state.audioFiles[0])
            }
            const audio = this.state.audioFiles[nextAudioIndex]
            const status = await playNext(this.state.playbackObj, audio.uri)
            this.updateState(this, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true, 
                currentAudioIndex: nextAudioIndex
            })
            await storeAudioForNextOpening(audio, nextAudioIndex)
        }
    }

    componentDidMount() {
        this.getPermission()
        loadAd()
        //this.registerNotifications()
        if (this.state.playbackObj === null) {
            this.setState({...this.state, playbackObj: new Audio.Sound()}, () => {
                Audio.setAudioModeAsync({staysActiveInBackground: true});
            })
            //this.state.playbackObj.setAudioModeAsync({staysActiveInBackground: true});
        }
    }

    updateState = (prevState, newState = {}) => {
        this.setState({...prevState, ...newState})
    }

    render() {
        const {audioFiles, playlist, addToPlaylist, dataProvider, currentAudio, permissionError, currentAudioIndex, isPlaying, playbackObj, soundObj, playbackPosition, playbackDuration, isPlaylistRunning, activePlaylist, refreshDataProvider, isAlreadyDownloading, musicsToDownload} = this.state
        let item = (<AudioContext.Provider value={{audioFiles, playlist, addToPlaylist, dataProvider, currentAudio, totalAudioCount: this.totalAudioCount, currentAudioIndex, isPlaying, playbackObj, soundObj, playbackPosition, playbackDuration , updateState: this.updateState, loadPreviousAudio: this.loadPreviousAudio, onPlaybackStatusUpdate: this.onPlaybackStatusUpdate, updateAudioFiles: this.updateAudioFiles,isPlaylistRunning, activePlaylist, refreshDataProvider, isAlreadyDownloading, checkMusicToDownload: this.checkMusicToDownload, musicsToDownload, downloadMusic: this.downloadMusic}}>
                        {this.props.children}
                    </AudioContext.Provider>)
        if (permissionError) {
            return (
                <View
                    style={
                        {
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }
                    }
                >
                    <Text style={{fontSize: 25, textAlign: 'center', color: 'red'}}>
                        It looks like you haven't accept the permission.
                        </Text>
                </View>
            )
        }

        if (refreshDataProvider) {
            console.log('passei aqui')
            this.getAudioFiles()
        }
        return <>{item}</>
    }
}

export default AudioProvider
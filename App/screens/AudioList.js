import React, {Component} from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { AudioContext } from '../context/AudioProvider.js'
import { RecyclerListView, LayoutProvider } from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem.js';
import Screen from '../components/Screen.js';
import OptionModal from '../components/OptionModal.js';
import { selectAudio } from '../misc/audioController'
import * as MediaLibrary from 'expo-media-library';


export default class AudioList extends Component {
    static contextType = AudioContext

    constructor(props) {
        super(props)
        this.state = {
            optionModalVisible: false,
            //playbackObj: null,
            //soundObj: null,
            //currentAudio: {},
            isPlaying: false,
        }
        this.currentItem = {}
    }

    layoutProvider = new LayoutProvider((i) => 'audio', (type, dim) => {
        switch (type) {
            case 'audio':
                dim.width = Dimensions.get('window').width
                dim.height = 70
                break
            default:
                dim.width = 0
                dim.height = 0
        }
    })

    /*onPlaybackStatusUpdate = async (playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
            this.context.updateState(this.context, {
                playbackPosition: playbackStatus.positionMillis,
                playbackDuration: playbackStatus.durationMillis
            })
        }

        if (playbackStatus.didJustFinish) {
            const nextAudioIndex = this.context.currentAudioIndex + 1
            if(nextAudioIndex >= this.context.totalAudioCount) {
                this.context.playbackObj.unloadAsync()
                return this.context.updateState(this.context, {
                    soundObj: null,
                    currentAudio: this.context.audioFiles[0],
                    isPlaying: false, 
                    currentAudioIndex: 0,
                    playbackPosition: null,
                    playbackDuration: null
                })
            }
            const audio = this.context.audioFiles[nextAudioIndex]
            const status = await playNext(this.context.playbackObj, audio.uri)
            this.context.updateState(this.context, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true, 
                currentAudioIndex: nextAudioIndex
            })
            await storeAudioForNextOpening(audio, nextAudioIndex)
        }
    }*/

    handleAudioPress = async audio => {
        await selectAudio(audio, this.context)
        /*const {soundObj, playbackObj, currentAudio, updateState, audioFiles} = this.context

        //play
        if (soundObj === null) {
            const playbackObj = new Audio.Sound()
            const status = await play(playbackObj, audio.uri)
            const index = audioFiles.indexOf(audio)
            console.log('audio is playing')
            updateState(this.context, {currentAudio: audio, playbackObj: playbackObj, soundObj: status, isPlaying: true, currentAudioIndex: index})
            playbackObj.setOnPlaybackStatusUpdate(this.context.onPlaybackStatusUpdate)
            return storeAudioForNextOpening(audio, index)
        }
        
        if (soundObj.isLoaded && soundObj.isPlaying && currentAudio.id === audio.id) {
            const status = await pause(playbackObj)
            console.log('audio is paused')
            return updateState(this.context, {soundObj: status, isPlaying: false})
        }

        if (
            soundObj.isLoaded &&
            !soundObj.isPlaying &&
            currentAudio.id === audio.id
        ) {
            //const status = this.state.playbackObj.playAsync()
            const status = await resume(playbackObj)
            console.log('audio is resumed')
            return updateState(this.context, {soundObj: status, isPlaying: true})
        }

        if (
            soundObj.isLoaded &&
            currentAudio.id !== audio.id
        ) {
            const status = await playNext(playbackObj, audio.uri)
            const index = audioFiles.indexOf(audio)
            updateState(this.context, {currentAudio: audio, soundObj: status, isPlaying: true, currentAudioIndex: index})
            return storeAudioForNextOpening(audio, index)
        }*/
    }

    componentDidMount() {
        this.context.loadPreviousAudio()
    }

    componentDidUpdate(prevProps) {

    }

    rowRenderer = (type, item, index, extendedState) => {
        
        return <AudioListItem 
        title={item.filename}
        isPlaying={extendedState.isPlaying}
        activeListItem={this.context.currentAudioIndex === index}
        duration={item.duration}
        onAudioPress={() => this.handleAudioPress(item)}
        onOptionPress={() => {
            this.currentItem = item
            this.setState({...this.state, optionModalVisible: true})
        }} />
    }

    navigateToPlaylist = () => {
        this.context.updateState(this.context, {
            addToPlaylist: this.currentItem,
        })
        this.props.navigation.navigate('Playlist')
    }

    deleteMusic = async () => {
        console.log(this.currentItem)
        await MediaLibrary.deleteAssetsAsync(this.currentItem)
        await this.context.updateAudioFiles()
        this.setState({...this.state, optionModalVisible: false})
    }

    render() {
        return <AudioContext.Consumer>
            {({dataProvider, isPlaying}) => {
                if (!dataProvider._data.length) return null
                return (
                    <Screen>
                        {<RecyclerListView 
                            dataProvider={dataProvider} 
                            layoutProvider={this.layoutProvider} 
                            rowRenderer={this.rowRenderer} 
                            extendedState={{ isPlaying, totalAudioCount: this.context.totalAudioCount}}
                        />}
                        <OptionModal 
                            //onPlayPress={() => this.handleAudioPress(this.currentItem)}
                            //onPlayListPress={() => {
                                //this.context.updateState(this.context, {
                                    //addToPlaylist: this.currentItem
                                //})
                                //this.props.navigation.navigate('Playlist')
                            //}}
                            options={[
                                {
                                    title: 'Add to Playlist', 
                                    onPress: this.navigateToPlaylist
                                },
                                {
                                    title: 'Delete music',
                                    onPress: this.deleteMusic
                                }
                            ]}
                            currentItem={this.currentItem} 
                            onClose={() => this.setState({...this.state, optionModalVisible: false})} 
                            visible={this.state.optionModalVisible} 
                        />
                    </Screen>
                )
            }}
        </AudioContext.Consumer>
    }
}

const styles = StyleSheet.create({
    filename: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
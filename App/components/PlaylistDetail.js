import React, {useContext, useState, useEffect} from 'react'
import { View, StyleSheet, FlatList, Text, Dimensions, Modal, TouchableOpacity } from 'react-native'
import AudioListItem from '../components/AudioListItem'
import { selectAudio }  from '../misc/audioController'
import { AudioContext } from '../context/AudioProvider'
import OptionModal from './OptionModal'
import AsyncStorage from "@react-native-async-storage/async-storage"

const PlaylistDetail = ({visible, playlist, onClose}) => {
    const context = useContext(AudioContext)
    //const playlist = props.route.params

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState({})
    const [audios, setAudios] = useState(playlist.audios)

    useEffect(() => {
        console.log(audios)
    }, [audios])

    const playAudio = async (audio) => {
        await selectAudio(audio, context, {activePlaylist: playlist, isPlaylistRunning: true})
    }

    const closeModal = () => {
        setSelectedItem({})
        setModalVisible(false)
    }

    const removeAudio = async () => {
        let isPlaying = context.isPlaying
        let isPlaylistRunning = context.isPlayingRunning
        let soundObj = context.soundObj
        let playbackPosition = context.playbackPosition
        let activePlaylist = context.activePlaylist

        if (context.isPlayingRunning && context.currentAudio.id === selectedItem.id) {
            await context.playbackObj.stopAsync()
            await context.playbackObj.unloadAsync()
            isPlaying = false
            isPlaylistRunning = false
            soundObj = null
            playbackPosition = 0
            activePlaylist = []
        }

        const newAudios = audios.filter(audio => audio.id !== selectedItem.id)
        const result = await AsyncStorage.getItem('playlist')

        if (result !== null) {
            const oldPlaylists = JSON.parse(result)
            const updatedPlaylists = oldPlaylists.filter((item) => {
                if (item.id === playlist.id) {
                    item.audios = newAudios
                }

                return item
            })
            AsyncStorage.setItem('playlist', JSON.stringify(updatedPlaylists))
            context.updateState(context, {playlist: updatedPlaylists, isPlaylistRunning, activePlaylist, playbackPosition, isPlaying, soundObj})
        }
        setAudios(newAudios)
        //console.log('Updated playlist: ', newAudios[newAudios.length - 1].uri)
        //console.log('Current playlist: ', audios[audios.length - 1].uri)
        closeModal()
    }

    const removePlaylist = async () => {
        console.log('Removing playlist')
        let isPlaying = context.isPlaying
        let isPlaylistRunning = context.isPlayingRunning
        let soundObj = context.soundObj
        let playbackPosition = context.playbackPosition
        let activePlaylist = context.activePlaylist

        if (context.isPlayingRunning && activePlaylist.id === playlist.id) {
            await context.playbackObj.stopAsync()
            await context.playbackObj.unloadAsync()
            isPlaying = false
            isPlaylistRunning = false
            soundObj = null
            playbackPosition = 0
            activePlaylist = []
        }

        const result = await AsyncStorage.getItem('playlist')

        if (result !== null) {
            const oldPlaylists = JSON.parse(result)
            const updatedPlaylists = oldPlaylists.filter((item) => item.id !== playlist.id)
            AsyncStorage.setItem('playlist', JSON.stringify(updatedPlaylists))
            context.updateState(context, {playlist: updatedPlaylists, isPlaylistRunning, activePlaylist, playbackPosition, isPlaying, soundObj})
        }
        onClose()
    }

    return (
        <>
        <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
            <View style={styles.container}>
                <View
                style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingVertical: 15,
                }}>
                    <Text style={styles.title}>{playlist.title}</Text>
                    <TouchableOpacity onPress={removePlaylist}>
                        <Text style={[styles.title, { color: 'red'}]}>Remove</Text>
                    </TouchableOpacity>
                </View>
                <FlatList 
                data={audios}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <View style={{marginBottom: 10}}>
                        <AudioListItem 
                        title={item.filename} 
                        duration={item.duration} 
                        onAudioPress={() => playAudio(item)}
                        onOptionPress={() => {
                            setSelectedItem(item)
                            setModalVisible(true)
                        }}
                        isPlaying={context.isPlaying} 
                        activeListItem={item.id === context.currentAudio.id} />
                    </View>
                )}
                contentContainerStyle={styles.listContainer} 
                />
            </View>
            <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
        </Modal>
        <OptionModal visible={modalVisible} onClose={closeModal} options={[{title: 'Remove from playlist', onPress: removeAudio}]} currentItem={selectedItem}/>
        </>
    )
}

const {width, height} = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        height: height - 150,
        width: width - 15,
        backgroundColor: 'white',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },
    listContainer: {
        padding: 20
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: 5,
        fontWeight: 'bold',
        color: 'blue',
    },
    modalBG: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: -1,
    }
})

export default PlaylistDetail
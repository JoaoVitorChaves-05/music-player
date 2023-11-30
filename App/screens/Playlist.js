import React, { useState, useContext, useEffect } from 'react'
import { Text, View, Button, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob'
import PlaylistInputModal from '../components/PlaylistInputModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioContext } from '../context/AudioProvider'
import PlaylistDetail from '../components/PlaylistDetail';

let selectedPlaylist = {}
const Playlist = ({navigation}) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [showPlaylist, setShowPlaylist] = useState(false)

    const context = useContext(AudioContext)
    let playlistDetail
    const {playlist, addToPlaylist, updateState} = context

    const createPlaylist = async playlistName => {
        const result = await AsyncStorage.getItem('playlist')
        if (result !== null) {
            const audios = []
            if(addToPlaylist) {
                console.log(addToPlaylist)
                audios.push(addToPlaylist)
            }
            const newList = {
                id: Date.now(),
                title: playlistName,
                audios: audios
            }

            const updatedList = [...playlist, newList]
            updateState(context, {addToPlaylist: null, playlist: updatedList})
            await AsyncStorage.setItem('playlist', JSON.stringify(updatedList))
        }
        setModalVisible(false)
    }

    const renderPlaylist = async () => {
        const result = await AsyncStorage.getItem('playlist')
        if (result === null) {
            const defaultPlaylist = {
                id: Date.now(),
                title: 'My Favorite',
                audios: []
            }

            const newPlaylist = [...playlist, defaultPlaylist]
            updateState(context, {playlist: [...newPlaylist]})
            return await AsyncStorage.setItem('playlist', JSON.stringify([...newPlaylist]))
        }

        updateState(context, {playlist: JSON.parse(result)})
    }

    useEffect(() => {
        if (!playlist.length) {
            renderPlaylist()
        }
    }, [])

    const handleBannerPress = async (playlist) => {
        // update playlist if there is any selected audio
        if (addToPlaylist) {
            const result = await AsyncStorage.getItem('playlist')
            // we want to check is that same audio is already inside our list or not

            let oldList = []
            let updatedList = []
            let sameAudio = false

            if (result !== null) {
                oldList = JSON.parse(result)
                
                updatedList = oldList.filter(list => {
                    if (list.id === playlist.id) {
                        for (let audio of list.audios) {
                            if (audio.id === addToPlaylist.id) {
                                sameAudio = true
                                return
                            }
                        }

                        list.audios = [...list.audios, addToPlaylist]
                    }
                    return list
                })
            }

            if (sameAudio) {
                Alert.alert('Found same audio!', `${addToPlaylist.filename} is already inside the list.`)
                sameAudio = false
                return updateState(context, {addToPlaylist: null})
            }

            updateState(context, {addToPlaylist: null, playlist: [...updatedList]})
            return AsyncStorage.setItem('playlist', JSON.stringify([...updatedList]))
        }
        selectedPlaylist = playlist
        //setShowPlaylist(true)
        setShowPlaylist(true)
    }

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                {playlist.length ? playlist.map(item => (
                    <TouchableOpacity key={item.id.toString()} onPress={() => handleBannerPress(item)} style={styles.playlistBanner}>
                        <Text>{item.title}</Text>
                        <Text style={styles.audioCount}>{item.audios.length > 1 ? `${item.audios.length} Songs` : `${item.audios.length} Song`}</Text>
                    </TouchableOpacity>
                    )
                ): null}
                
                <TouchableOpacity onPress={() => {
                    setModalVisible(true)
                }} style={{marginTop: 15}}>
                    <Text style={styles.playlistBtn, { color: 'blue' }}>+ Add New Playlist</Text>
                </TouchableOpacity>
                <PlaylistInputModal 
                    visible={modalVisible} 
                    onClose={() => setModalVisible(false)}
                    onSubmit={createPlaylist}
                />
            </ScrollView>
            {showPlaylist ? <PlaylistDetail visible={showPlaylist} playlist={selectedPlaylist} onClose={() => setShowPlaylist(false)} onOpen={() => setShowPlaylist(true)}/> : null}
            <AdMobBanner
                style={styles.banner}
                bannerSize="fullBanner"
                adUnitID="ca-app-pub-2088794319704540/1070673040" // True ID
                servePersonalizedAds={true} // true or false
                onDidFailToReceiveAdWithError={(err) => console.log(err)} 
            />
        </>
        
    )
    
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1000
    },
    container: {
        padding: 20,
    },
    playlistBanner: {
        padding: 5,
        backgroundColor: 'rgba(204, 204, 204, 0.3)',
        borderRadius: 5,
        marginBottom: 15,
    },
    audioCount: {
        marginTop: 5,
        opacity: 0.5,
        fontSize: 14,
    },
    playlistBtn: {
        color: 'white',
        letterSpacing: 1,
        fontWeight: 'bold',
        fontSize: 14,
        padding: 5
    }
})

export default Playlist
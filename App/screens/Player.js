import React, {useContext, useEffect, useState} from 'react'
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Modal, TextInput, ScrollView} from 'react-native'
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import PlayerButton from '../components/PlayerButton';
import Screen from '../components/Screen';
import Slider from '@react-native-community/slider';
import { AudioContext } from '../context/AudioProvider';
import { play, pause, resume, playNext, changeAudio } from '../misc/audioController'
import { storeAudioForNextOpening } from '../misc/helper'
import { AdMobBanner } from 'expo-ads-admob'
import { selectAudio } from '../misc/audioController'

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

const { width } = Dimensions.get('window')

const Player = () => {
    const context = useContext(AudioContext)
    const { playbackPosition, playbackDuration, currentPosition } = context
    const [modalVisible, setModalVisible] = useState(false)
    const [textValue, setTextValue] = useState('')
    const [lyrics, setLyrics] = useState("")

    const getNameOfAudio = () => {
        if (context.currentAudioIndex !== null)
            return context.audioFiles[context.currentAudioIndex].filename
        return 'Select music in "Musics"'
    }

    const calculateSeebBar = () => {
        if (playbackPosition !== null && playbackDuration !== null) {
            return playbackPosition / playbackDuration
        }

        if (context.currentAudio.lastPosition) {
            return context.currentAudio.lastPosition / (context.currentAudio.duration * 1000)
        }

        return 0
    }

    const getLyrics = async () => {
        fetch(`https://beat-lyrics.herokuapp.com/song/${textValue}`)
        .then(l => l.json())
        .then(ly => {
            setLyrics(ly.song)
            console.log(lyrics)
        })
    }

    useEffect(() => {
        context.loadPreviousAudio()

    }, [])

    const colorPlayer = () => {
        if (context.isPlaying === true)
            return (<FontAwesome5 name="compact-disc" size={250} color="#01bee2" />)
        return (<FontAwesome5 name="compact-disc" size={250} color="gray" />)
    }

    const handlePrevious = async () => {
        await changeAudio(context, 'previous')

    }

    const handlePlayPause = async () => {
        await selectAudio(context.currentAudio, context)
    }

    const handleNext = async () => {
        await changeAudio(context, 'next')
    }

    const renderCurrentTime = () => {
        if (!context.soundObj && context.currentAudio.lastPosition) {
            return millisToMinutesAndSeconds(context.currentAudio.lastPosition)
        }
        return millisToMinutesAndSeconds(playbackPosition)
    }

    if (!context.currentAudio) return null

    return (
        <Screen>
            <View style={styles.player}>
                <View style={styles.item}>
                    <Text numberOfLines={1} style={styles.musicName}>{getNameOfAudio()}</Text>
                </View>
                <View style={styles.item}>
                    {context.isPlaylistRunning && (
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold' }}>From Playlist: </Text>
                        <Text>{context.activePlaylist.title}</Text>
                    </View>
                    )}
                    <Text>{`${context.currentAudioIndex + 1} / ${context.totalAudioCount}`}</Text>
                </View>
                <View style={styles.item}>
                    {colorPlayer()}
                </View>
                <View style={styles.progressMusic}>
                    <Text style={styles.timeText}>{renderCurrentTime()}</Text>
                    <Slider
                        style={{width: '75%', height: 40}}
                        minimumValue={0}
                        maximumValue={1}
                        value={calculateSeebBar()}
                        minimumTrackTintColor="black"
                        maximumTrackTintColor="red"
                        onValueChange={ async (value) => {
                            const nextValueOfMusic = value*playbackDuration
                            await context.playbackObj.setPositionAsync(nextValueOfMusic)
                        }}
                        onSlidingStart={ async () => {
                            if (!context.isPlaying) return

                            try {
                                await pause(context.playbackObj)
                            } catch (error) {
                                console.log('error inside onSlidingStart callback', error)
                            }
                        }}
                        onSlidingComplete={ async () => {
                            if (context.soundObj === null) return

                            try {
                                await resume(context.playbackObj)
                            } catch (error) {
                                console.log('error inside onSlidingComplete callback', error)
                            }
                        }}
                    />
                    <Text style={styles.timeText}>{millisToMinutesAndSeconds(playbackDuration)}</Text>
                </View>
                <View style={styles.controllers}>
                    <PlayerButton onPress={handlePrevious} iconType="PREV" />
                    <PlayerButton onPress={handlePlayPause} iconType={ context.isPlaying ? "PLAY" : "PAUSE" } />
                    <PlayerButton onPress={handleNext} iconType="NEXT" />       
                </View>
                <TouchableOpacity
                    style={styles.singButton}
                    onPress={() => {
                        setModalVisible(true)
                    }}
                >
                    <Text style={styles.singText}>Sing</Text>
                </TouchableOpacity>
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false)
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.searchContainer}>
                            <TextInput placeholder="Search lyrics here" style={styles.searchBox} value={textValue} onChangeText={(text) => setTextValue(text)} />
                            <TouchableOpacity style={styles.searchButton} onPress={getLyrics}>
                                <AntDesign name="search1" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <View style={styles.lyricsBox}>
                                <Text style={styles.lyrics}>{lyrics}</Text>
                            </View>
                        </ScrollView>
                        
                    </View>
                </Modal>
                <AdMobBanner
                    style={styles.banner}
                    bannerSize="fullBanner"
                    adUnitID="ca-app-pub-2088794319704540/1070673040" // True ID
                    servePersonalizedAds={true} // true or false
                    onDidFailToReceiveAdWithError={(err) => console.log(err)} 
                />
            </View>
        </Screen>
    )
}

/*
<AdMobBanner
    style={styles.banner}
    bannerSize="fullBanner"
    adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
    servePersonalizedAds={true} // true or false
    onDidFailToReceiveAdWithError={this.bannerError} 
/>
*/
const styles = StyleSheet.create({
    player: {
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
    },
    musicName: {
        fontSize: 28,
        color: 'black',
        marginBottom: '5%'
    },
    controllers: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    slider: {
        width: width - 80, 
        height: 40
    },
    progressMusic: {
        flexDirection: 'row',
    },
    timeText: {
        marginTop: 10
    },
    banner: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1000
    },
    singButton: {
        backgroundColor: 'white',
        borderColor: 'blue',
        borderRadius: 5,
        borderWidth: 1,
        width: width - 80,
        padding: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    singText: {
        fontSize: 20,
        fontWeight: '200',
        color: 'blue',
    },
    centeredView: {
        flex: 1,
        alignItems: "center",
        backgroundColor: 'white'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 10,
    },
    searchBox: {
        width: '85%',
        height: '100%',

        fontSize: 18,
        paddingVertical: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        color: 'black',

        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingLeft: 10,
    },
    searchButton: {
        backgroundColor: 'blue',
        width: '15%',
        height: '100%',
        paddingVertical: 5,
        alignItems: 'center',

        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    lyricsBox: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        width: '100%',
        height: '100%',

    },
    lyrics: {
        fontSize: 20,
    }
})

export default Player
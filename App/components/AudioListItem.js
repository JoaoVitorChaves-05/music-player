import React from 'react'
import { View, StyleSheet, Text, Dimensions, TouchableWithoutFeedback } from 'react-native'
import { Entypo} from '@expo/vector-icons';

const getThumbnailText = (filename) => filename[0]

const convertTime = minutes => {
    if (minutes) {
        const hrs = minutes / 60
        const minute = hrs.toString().split('.')[0]
        const percent = parseInt(hrs.toString().split('.')[1].slice(0, 2))
        const sec = Math.ceil((60 * percent) / 100)

        if (parseInt(minute) < 10 && sec < 10)
            return `0${minute}:0${sec}`

        if (parseInt(minute) < 10)
            return `0${minute}:${sec}`

        if (sec < 10)
            return `${minute}:0${sec}`

        return `${minute}:${sec}`
    }
}

const renderPlayPauseIcon = isPlaying => {
    if (isPlaying) return <Entypo name="controller-paus" size={24} color="blue" />
    return <Entypo name="controller-play" size={24} color="blue" />
}

const AudioListItem = ({title, duration, onOptionPress, onAudioPress, isPlaying, activeListItem}) => {
    return (
        <>
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={onAudioPress}>
                    <View style={styles.leftContainer}>
                        <View style={styles.thumbnail}>
                            <Text style={styles.thumbnailText}>{activeListItem ? renderPlayPauseIcon(isPlaying) : getThumbnailText(title)}</Text>
                        </View>
                        <View style={styles.titleContainer}>
                            <Text
                                style={styles.titleContainer}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                            <Text numberOfLines={1} style={styles.timeText}>{convertTime(duration)}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.rightContainer}>
                    <Entypo 
                    onPress={onOptionPress}
                    name="dots-three-vertical" 
                    size={24} 
                    color="black"
                    style={{ padding: 10 }} />
                </View>
            </View>
            <View style={styles.separator} />
        </>
    )
}

const { width } = Dimensions.get('window')
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: 'center',
        width: width - 80,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightContainer: {
        flexBasis: 50,
        height: 50,
        alignItems: 'center',
    },
    thumbnail: {
        height: 50,
        flexBasis: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    thumbnailText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
    },
    titleContainer: {
        width: width - 180,
        paddingLeft: 10,
    },
    title: {
        fontSize: 16,
        color: 'black',
    },
    separator: {
        width: width - 80,
    },
    timeText: {
        fontSize: 14,
        color: 'black',
    },
    playerController: {
    },
    leftIcon: {
        flex: 1,
    },
    middleIcon: {
        flex: 1,
    },
    rightIcon: {
        flex: 1,
    }
})

export default AudioListItem
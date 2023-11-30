import React, {useContext} from 'react';
import { View, StyleSheet, Text, Dimensions, Image, TouchableWithoutFeedback, PermissionsAndroid, Alert} from 'react-native';
import ytdl from "react-native-ytdl"
import {AudioContext} from '../context/AudioProvider'


const DownloadListItem = ({title, channel, description, id, thumbnail}) => {
    const context = useContext(AudioContext)

    const download = async () => {
        try {

            /*
            for (let i = 0; i < audioFormats.length; i++) {
                if (audioFormats[i].container === 'mp4') {
                    title = title.replace('/', '-')
                    if (context.checkMusicToDownload({title: title, url: audioFormats[i].url})) {
                        if (context.musicsToDownload.length === 1)
                            context.downloadMusic()
                    }
                    else {
                        Alert.alert(
                            "Error",
                            "This music was added to downloader. Please select another music",
                            [
                              { text: "OK", onPress: () => console.log("OK Pressed") }
                            ]
                          );
                    }
                }
            }
            */

            // example downloadable url = https://download-api.herokuapp.com/?id=0i2pQnzN9BY&title=NomeDaMúsica
            let titleUrl = encodeURIComponent(title)
            if (context.checkMusicToDownload({title: title, url: `https://download-api.herokuapp.com/?id=${id}&title=${titleUrl}`})) {
                if (context.musicsToDownload.length === 1)
                    context.downloadMusic()
            }
            else {
                Alert.alert(
                    "Error",
                    "This music was added to downloader. Please select another music",
                    [
                      { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                  );
            }
        } catch (error) {
            console.warn(error);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={async () => {            
            Alert.alert(
                "Download",
                "Do you want download this music?",
                [
                    { text: "No", onPress: () => {
                        console.log("You aren't downloading the music'")
                    }},
                    { text: "Yes", onPress: async () => {
                        await download()
                    }}
                ]
            )
            
        }}>
            <View style={styles.videoItem}>
                <Image
                    style={styles.image}
                    source={{uri: thumbnail}}
                />
                <View style={styles.videoInfo}>
                    <Text style={styles.title} numberOfLines={4}>{title}</Text>
                    <Text numberOfLines={2} style={styles.channel}>{channel}</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const {width} = Dimensions.get('window')

const styles = StyleSheet.create({
    videoItem: {
        width: width,
        height: 125,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        paddingVertical: 10,
    },
    image: {
        width: 120,
        height: '100%',
        marginHorizontal: 5,
    },
    videoInfo: {
        flexDirection: 'column',
        width: width - 120,
        height: '100%',
        marginHorizontal: 5,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    title : {
        fontSize: 16,
    },
    channel: {
        fontSize: 12,
        justifyContent: 'flex-end',
    },
    description: {
        marginTop: 10,
        fontSize: 12,
    }
})

export default DownloadListItem
import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
    async function download() {
        const fileUrl = 'https://filesamples.com/samples/document/xlsx/sample1.xlsx'
        const fileName = 'sample1.xlsx'
        FileSystem.downloadAsync(fileUrl, FileSystem.documentDirectory + fileName)
            .then(({ uri }) => {
                console.log('Finished downloading to ', uri);
                saveFile(uri);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async function download2() {
    const fileUrl =
        'https://filesamples.com/samples/image/jpeg/sample_640%C3%97426.jpeg';
    const fileName = 'sample_640×426.jpeg';

    FileSystem.downloadAsync(fileUrl, FileSystem.documentDirectory + fileName)
        .then(({ uri }) => {
        console.log('Finished downloading to ', uri);
        saveFile(uri);
        })
        .catch((error) => {
        console.error(error);
        });
    }

    async function saveFile(filePath) {
        const albumName = 'my album';
        const permission = await MediaLibrary.requestPermissionsAsync();

        let asset = null;
        if (permission.granted) {
            try {
                asset = await MediaLibrary.createAssetAsync(filePath);
            } catch (e) {
                console.error('MediaLibrary.createAssetAsync failed', e);
            }

            if (asset) {
                try {
                    let album = await MediaLibrary.getAlbumAsync(albumName);
                    if (album) {
                        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                    } else {
                        album = await MediaLibrary.createAlbumAsync(
                        albumName,
                        asset,
                        false
                        );
                    }
                    const assetResult = await MediaLibrary.getAssetsAsync({
                    first: 1,
                    album,
                    sortBy: MediaLibrary.SortBy.creationTime,
                    });
                    asset = await assetResult.assets[0];
                } catch (e) {
                    console.error(' failed', e);
                }
            } else {
                console.error('unable to use MediaLibrary, can not create assets');
            }
        }
    }

    return (
        <View style={styles.container}>
            <Button title="download .xlsx" onPress={download}></Button>
        <Text></Text>
            <Button title="download .jpeg" onPress={download2}></Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
        padding: 8,
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

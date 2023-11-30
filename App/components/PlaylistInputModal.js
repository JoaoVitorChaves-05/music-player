import React, { useState }from 'react'
import { View, Text, StyleSheet, Modal, TextInput, Dimensions, TouchableWithoutFeedback } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

const PlaylistInputModal = ({visible, onClose, onSubmit}) => {

    const [playlistName, setPlaylistName] = useState('')

    const handleOnSubmit = () => {
        if (!playlistName.trim()) {
            onClose()
        } else {
            onSubmit(playlistName)
            setPlaylistName('')
            onClose()
        }
    }

    return (
        <Modal visible={visible} animationType='fade' transparent>
            <View style={styles.modalContainer}>
                <View style={styles.inputContainer}>
                    <Text>Create a new playlist</Text>
                    <TextInput value={playlistName} onChangeText={(text) => setPlaylistName(text)} style={styles.input} />
                    <AntDesign 
                        name="check" 
                        size={24} 
                        color="white" 
                        style={styles.submitIcon}
                        onPress={handleOnSubmit}
                    />
                </View>
            </View>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: width - 20,
        height: 200,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: width - 40,
        borderBottomWidth: 1,
        borderBottomColor: 'blue',
        fontSize: 18,
        paddingVertical: 5
    },
    submitIcon: {
        padding: 10,
        backgroundColor: 'blue',
        borderRadius: 50,
        marginTop: 15
    },
    modalBG: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: -1
    }
})

export default PlaylistInputModal
import React from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'

const Screen = ({ children }) => {
    return <View style={styles.container}>{children}</View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(239, 239, 239, 0.8)',
        paddingTop: StatusBar.currentHeight,
    }
})

export default Screen
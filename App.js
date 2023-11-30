//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AudioProvider from './App/context/AudioProvider.js'
import AudioList from './App/screens/AudioList.js';
import Player from './App/screens/Player.js';
import Download from './App/screens/Download.js'
import Playlist from './App/screens/Playlist.js';
import { NotificationProvider } from 'react-native-internal-notification';

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NotificationProvider>
      <AudioProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Musics" component={AudioList} options={{
              tabBarIcon: () => {
                return <FontAwesome name="music" size={24} color="black" />
              }
            }}/>
            <Tab.Screen name="Player" component={Player} options={{
              tabBarIcon: () => {
                return <FontAwesome5 name="compact-disc" size={24} color="black" />
              }
            }}/>
            <Tab.Screen name="Download" component={Download} options={{
              tabBarIcon: () => {
                return <FontAwesome name="download" size={24} color="black" />
              }
            }}/>
            <Tab.Screen name="Playlist" component={Playlist} options={{
              tabBarIcon: () => {
                return <MaterialCommunityIcons name="playlist-music" size={24} color="black" />
              }
            }}/>
          </Tab.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </NotificationProvider>
  )
}

// React Native Styles
const styles = StyleSheet.create({
  downloadScreen: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'black'
  },
  audioListScreen: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'black'
  },
});
import React, { Component } from 'react'
import { TextInput, View, StyleSheet, TouchableOpacity, Text, Dimensions, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Screen from '../components/Screen'
import DownloadListItem from '../components/DownloadListItem'
import { RecyclerListView, LayoutProvider, DataProvider } from 'recyclerlistview';

const ViewTypes = {
    FULL: 0,
    HALF_LEFT: 1,
    HALF_RIGHT: 2
};

export default class Download extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            canGetData: false,
            dataProvider: new DataProvider((r1, r2) => {
                return r1 !== r2
            }),
            data: []
        }
    }

    layoutProvider = new LayoutProvider((index) => {
        return index
    }, (type, dim) => {
        dim.width = width
        dim.height = 125
    })

    //Credencias API do youtube: AIzaSyBK4EdD4YhRU-mLZzYKrzFURhFyEA9_6ao

    rowRenderer = (type, item) => {
        
        return <DownloadListItem 
                    title={item.snippet.title}
                    channel={item.snippet.channelTitle}
                    id={item.id.videoId}
                    thumbnail={item.snippet.thumbnails.medium.url}
                />
    }

    render() {
        let item

        const dimensions = Dimensions.get('window');

        const fetchData = () => {
            if (this.state.data.length > 0) {
                this.setState({data: []})
            }
            fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${this.state.value}&type=video&key=AIzaSyBK4EdD4YhRU-mLZzYKrzFURhFyEA9_6ao`)
            .then(res=>res.json())
            .then(dataVideos=>{
                this.setState({
                    ...this.state,
                    dataProvider: this.state.dataProvider.cloneWithRows([...this.state.data, ...dataVideos.items]),
                    data: [...this.state.data, ...dataVideos.items]
                })
                //setMiniCard(data.items)
            })
        }

        return (
            <Screen>
                <View>
                    <View style={styles.searchContainer}>
                        <TextInput placeholder="Search videos here" style={styles.searchBox} value={this.state.value} onChangeText={(text) => this.setState({value: text})} />
                        <TouchableOpacity style={styles.searchButton} onPress={() => {this.setState({canGetData: true}); fetchData()}}>
                            <AntDesign name="search1" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    this.state.canGetData ? 
                    <RecyclerListView 
                        style={{width: width, height: height}} 
                        layoutProvider={this.layoutProvider} 
                        dataProvider={this.state.dataProvider} 
                        rowRenderer={this.rowRenderer} 
                    /> : 
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text styles={styles.textInicial}>Search musics here to download</Text>
                    </View>
                }
            </Screen>
        )
        
        
    }
}

const {width} = Dimensions.get('window')
const {height} = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    banner: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1000
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 10,
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
    videosContainer: {
        flexDirection: 'column',
    },
    videoItem: {
        width: width,
        height: 125,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    image: {
        width: '30%',
        height: '100%',
    },
    videoInfo: {
        flexDirection: 'column',
        width: '70%',
        height: '100%',
        marginHorizontal: 5,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: 'red',
    },
    title : {
        fontSize: 22,
    },
    channel: {
        fontSize: 16
    },
    description: {
        marginTop: 10,
        fontSize: 12,
    }
})
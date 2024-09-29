import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Dimensions, Image, Animated, TouchableWithoutFeedback, TouchableOpacity, PermissionsAndroid, Share, Alert } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { FileSystem } from 'react-native-filesystem';
import { CameraRoll } from '@react-native-community/cameraroll';

const { width } = Dimensions.get('window')

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      images: [],
      scale: new Animated.Value(1),
      isImageFocused: false
    };
    this.scale = {
      transform: [{ scale: this.state.scale }]
    };
    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, -70]
    });
    this.borderRadius = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, 0]
    });

  }

  loadWallpapers = () => {
    axios.get('https://api.unsplash.com/photos/random?count=100&client_id=QMVaRtQpTQcRyKiYNNBlF4GgoHP1tSQ2D1q8qkXXS1E')
      .then(function (response) {
        console.log(response.data);
        this.setState({ images: response.data, isLoading: false });
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
        console.log('request completed');
      });
  }

  componentDidMount() {
    this.loadWallpapers()
  }

  saveToCameraRoll = async image => {
    let cameraPermissions = await PermissionsAndroid.getAsync(PermissionsAndroid.CAMERA_ROLL);
    if (cameraPermissions.status !== 'granted') {
      cameraPermissions = await PermissionsAndroid.askAsync(PermissionsAndroid.CAMERA_ROLL);
    }

    if (cameraPermissions.status === 'granted') {
      FileSystem.downloadAsync(
        image.urls.regular,
        FileSystem.documentDirectory + image.id + '.jpg'
      )
        .then(({ uri }) => {
          CameraRoll.saveToCameraRoll(uri);
          alert('Saved to photos');
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      alert('Requires cameral roll permission');
    }
  };

  showControls = (item) => {
    this.setState((state) => ({
      isImageFocused: !state.isImageFocused
    }), () => {
      if (this.state.isImageFocused) {
        Animated.spring(this.state.scale, {
          toValue: 0.9
        }).start()
      }
      else {
        Animated.spring(this.state.scale, {
          toValue: 1
        }).start()
      }
    })
  }

  infoApp = () => {
    Alert.alert("About",
      "Unsplash\nwww.unsplash.com \n\nIn 2013, Unsplash launched as a Tumblr blog with 10 high-resolution photos that could be used for anything. Today, Unsplash powers more people and products than any other visual search engine in the world, with more than 100 million images downloaded every month more than the rest of the industry combined. \n\nWe’re building a community where the principles of sharing and openness have taken the place of copyright and red tape.Instead of photos being hoarded and shut down, photos on Unsplash are given as fuel for creativity.");
  }

  shareWallpaper = async (image) => {
    try {
      await Share.share({
        message: 'Checkout this image: ' + image.urls.full
      })
    } catch (error) {
      console.log(error)
    }
  }

  renderItem = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="grey" />
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{ height: '100%', width }, this.scale]}>
            <Animated.Image
              style={{ flex: 1, height: null, width: null, borderRadius: this.borderRadius }}
              source={{ uri: item.urls.regular }}
              resizeMode="cover" />
          </Animated.View>
        </TouchableWithoutFeedback>

        <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: this.actionBarY, height: 70, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-around' }}>


          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.loadWallpapers()}>
              <Ionicons name="ios-refresh" color="white" size={35} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.shareWallpaper(item)}>
              <Ionicons name="ios-share-outline" color="white" size={35} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.infoApp()}>
              <Ionicons name="ios-information-circle-outline" color="white" size={36} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )
  }

  render() {
    return this.state.isLoading ? (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    ) : (
      <View style={{ flex: 1, backgroundColor: 'black', }} >
        <FlatList
          scrollEnabled={!this.state.isImageFocused}
          horizontal
          pagingEnabled
          data={this.state.images}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

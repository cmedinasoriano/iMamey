/**
 * iMamey
 * 
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  Image,
  ListView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableElement,
  TouchableHighlight,
  View,
} from 'react-native';

import Dimensions from 'Dimensions';
import Swiper from 'react-native-swiper';
import Orientation from 'react-native-orientation';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


export default class IMameySlidesView extends Component {


  constructor(props) {
    super(props);

  }

  componentWillMount() {
    Orientation.lockToPortrait();
    
  }

  componentDidMount() {
    
  }

  render() {

    return (

      <View style={styles.container} >
        <StatusBar barStyle='light-content' />
        <Swiper style={styles.wrapper} dotColor='#888' 
        showsPagination={false}
        autoplay autoplayTimeout={7}
        >
          <View style={styles.slide}>
            <Image style={[styles.img]} source={require('../../resources/images/page1.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page2.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page3.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page4.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page5.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page6.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page7.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page8.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page9.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page10.jpg')} />
          </View>
          <View style={styles.slide}>
            <Image style={styles.img} source={require('../../resources/images/page11.jpg')} />
          </View>
        </Swiper>
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  wrapper: {

  },
  slide: {
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  img: {
    resizeMode: 'cover',
    width: 'auto',
    height: '100%',
    backgroundColor: 'transparent',
  },
  pagination: {
    bottom: 65,
  },

});


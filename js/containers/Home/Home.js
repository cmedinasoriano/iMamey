/**
 * iMamey
 * 
 * @flow
 */

import React from 'react';
import {
  Image,
  StatusBar,
  View
} from 'react-native';

import Swiper from 'react-native-swiper';

import styles from './styles';

const images = [
  require('./../../../resources/images/page1.jpg'),
  require('./../../../resources/images/page2.jpg'),
  require('./../../../resources/images/page3.jpg'),
  require('./../../../resources/images/page4.jpg'),
  require('./../../../resources/images/page5.jpg'),
  require('./../../../resources/images/page6.jpg'),
  require('./../../../resources/images/page7.jpg'),
  require('./../../../resources/images/page8.jpg'),
  require('./../../../resources/images/page9.jpg'),
  require('./../../../resources/images/page10.jpg'),
  require('./../../../resources/images/page11.jpg')
]

export default () => (
  <View style={styles.container} >
    <StatusBar barStyle={'light-content'} />
    <Swiper dotColor={'#888'} 
    showsPagination={false}
    autoplay autoplayTimeout={7} >
      {
        images.map((image, index) => (
          <View key={index} style={styles.slide} >
            <Image style={styles.img} source={image} />
          </View>
        ))
      }
    </Swiper>
  </View>
);

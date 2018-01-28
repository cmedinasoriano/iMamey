/**
 * iMamey
 * 
 * @flow
 */

import React, { Component } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  WebView,
} from 'react-native';
import Orientation from 'react-native-orientation';

import styles from './styles';

export default (props) => {

  const navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
  });
  
  const { params } = props.navigation.state;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'default'} />
      <WebView style={styles.webview} source={{uri: params.url}} />
    </View>
  );

}

/**
 * iMamey
 * 
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  ListView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  WebView,
} from 'react-native';
import Dimensions from 'Dimensions';
import SafariView from "react-native-safari-view";
import Orientation from 'react-native-orientation';
import moment from 'moment';


export default class IMameyWebView extends Component {

  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
  });

  constructor(props) {
    super(props);

  }

  componentDidMount() {
    
  }

  componentWillMount() {
    Orientation.unlockAllOrientations();
  }

  componentWillUnmount() {
    Orientation.lockToPortrait();
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle='default' />
        <WebView style={styles.webview} source={{uri: params.url}} />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },

});

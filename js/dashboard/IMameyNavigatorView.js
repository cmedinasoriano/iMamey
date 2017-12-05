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

import {
  StackNavigator,
} from 'react-navigation';

import Dimensions from 'Dimensions';
import SafariView from "react-native-safari-view";
import moment from 'moment';

import IMameyDashboardView from '../dashboard/IMameyDashboardView';
import IMameyLessonsView from '../dashboard/IMameyLessonsView';
import IMameyWebView from '../dashboard/IMameyWebView';

const AppNavigator = StackNavigator({
  Main: {
    screen: IMameyDashboardView, 
    navigationOptions: ({navigation}) => ({
      header: null,
    }),
  },
  Lessons: {screen: IMameyLessonsView},
  WebView: {screen: IMameyWebView},
}, {
  cardStyle: {backgroundColor: 'transparent',}
});

export default class IMameyNavigatorView extends Component {

  constructor(props) {
    super(props);

  }


  componentDidMount() {

  }

  componentWillMount() {
    
  }

  render() {

    return (
      <AppNavigator ref={nav => { this.navigator = nav; }} />
    );
  }
}

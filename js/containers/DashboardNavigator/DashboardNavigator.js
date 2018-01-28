/**
 * iMamey
 * 
 * @flow
 */

import React from 'react';

import {
  StackNavigator,
} from 'react-navigation';

import Dashboard from './../../components/Dashboard/Dashboard';
import Lessons from './../../components/Lessons/Lessons';
import WebView from './../../components/WebView/WebView';

const AppNavigator = StackNavigator({
  Main: {
    screen: Dashboard, 
    navigationOptions: ({navigation}) => ({
      header: null,
    }),
  },
  Lessons: {screen: Lessons},
  WebView: {screen: WebView},
}, {
  cardStyle: {backgroundColor: 'transparent',}
});

export default () => (
  <AppNavigator ref={nav => { this.navigator = nav; }} />
)

/**
 * iMamey
 * 
 * @flow
 */

import React, { Component } from 'react';
import {
  ListView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Dimensions from 'Dimensions';
import SafariView from "react-native-safari-view";
import moment from 'moment';

import styles from './styles';

export default class Lessons extends Component {

  regex = /title=.*?(["'`]).*?(Lecci.n[^>\1]*?)\1(?:.|[\n\r])*?href=(["'`])(https?:\/\/teotecnologia\.com\/eldiscipulo\/Lecci.n[^>\3]*?\.pdf)\3/ig

  static navigationOptions = {
    title: 'Lecciones: teotecnologia.com',
  };

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };

  }

  async getData() {
    
    try {

      const body = {
        method: 'GET'
      }
        
      const uri = 'http://www.eldiscipulo.org/presentaciones.html';

      const response = await fetch(uri, body);
      const responseData = await response.text();

      this.lastEventsUpdateDate = moment();

      let items = [];

      regex = /title=.*?(["'`]).*?(Lecci.n[^>\1]*?)\1(?:.|[\n\r])*?href=(["'`])(https?:\/\/teotecnologia\.com\/eldiscipulo\/Lecci.n[^>\3]*?\.pdf)\3/ig
      while (match = this.regex.exec(responseData)) {
        // push in reverse
        items.unshift({title: match[2], url: match[4]})
      }

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(items)
      });
    } catch (error) {
      console.log(error);
    }
  }

  componentWillMount() {
    this.getData();    
  }

  renderRow(rowData, sectionId, rowId) {
    return (
      <TouchableHighlight 
        key={rowId} 
        onPress={() => this.openURL(rowData.url, rowData)}
        underlayColor='#f0f0f0'
        style={[styles.row, (rowId != Object.keys(this.state.dataSource._dataBlob[sectionId]).length - 1) ? {} : { marginBottom: 0 }]}>
        <Text style={[styles.title, styles.text]}>{rowData.title}</Text>
      </TouchableHighlight>
    );
  }

  async openURL(url, navData) {

    console.log(url);

    const { navigate } = this.props.navigation;
    if (Platform.OS == 'ios') {

      try {
        const available = await SafariView.isAvailable();
        console.log("is available");

        SafariView.show({
          url: url,
          fromBottom: true,
        });

      } catch(error) {
        // Fallback WebView code for iOS 8 and earlier
        console.log(url, error);
        navigate('WebView', { title: navData.title, url: url })
      }

    } else {
      url = `http://drive.google.com/viewerng/viewer?embedded=true&url=${url}`;
      navigate('WebView', { title: navData.title, url: url })
    }
  }

  render() {

    return (

      <View style={styles.container} >
        <StatusBar barStyle='default' />
        
        <ListView
          enableEmptySections
          dataSource={this.state.dataSource}
          scrollEventThrottle={1}
          scrollEnabled={this.state.canScroll}
          renderRow={this.renderRow.bind(this)}
          contentContainerStyle={styles.lessons}
          ref='PTRListView' />
      </View>
    );
  }

}


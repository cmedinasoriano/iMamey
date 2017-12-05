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
} from 'react-native';
import Dimensions from 'Dimensions';
import SafariView from "react-native-safari-view";
import Orientation from 'react-native-orientation';
import moment from 'moment';


export default class IMameyLessonsView extends Component {

  static navigationOptions = {
    title: 'Lecciones: teotecnologia.com',
  };

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };

    if (Platform.OS == 'ios') {
      let showSubscription = SafariView.addEventListener(
        "onShow",
        () => {
          Orientation.unlockAllOrientations();
        }
      );

      let dismissSubscription = SafariView.addEventListener(
        "onDismiss",
        () => {
          Orientation.lockToPortrait();
        }
      );
    }
  }


  componentDidMount() {

  }

  componentWillMount() {
    
    Orientation.lockToPortrait();

    let body = {
      method: 'GET',
    }

    let uri = 'http://www.eldiscipulo.org/presentaciones.html'

    fetch(uri, body)
      .then((response) => response.text())
      .then((responseData) => {

        this.lastEventsUpdateDate = moment();

        console.log(responseData);

        let regex = /title=.*?(["'`]).*?(Lecci.n[^>\1]*?)\1(?:.|[\n\r])*?href=(["'`])(https?:\/\/teotecnologia\.com\/eldiscipulo\/Lecci.n[^>\3]*?\.pdf)\3/ig

        let items = [];

        while (match = regex.exec(responseData)) {
          // push in reverse
          items.unshift({title: match[2], url: match[4]})
  			}

        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(items)
        });

      })
      .catch((error) => {
        console.log(error);
      }).done();
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

  renderRow(rowData, sectionId, rowId) {
    return (
      <TouchableHighlight 
        key={rowId} 
        onPress={() => this.openURL(rowData.url, rowData)}
        underlayColor='#f0f0f0'
        style={[styles.row, (rowId != Object.keys(this.state.dataSource._dataBlob[sectionId]).length - 1) ? {} : { marginBottom: 0 }]}>
        <Text style={[styles.h1, styles.text]}>{rowData.title}</Text>
      </TouchableHighlight>
    );
  }

  openURL(url, navData) {
    const { navigate } = this.props.navigation;
    if (Platform.OS == 'ios') {
      SafariView.isAvailable()
        .then(availale => {
          SafariView.show({
            url: url,
            fromBottom: true,
          });
        })
        .catch(error => {
          // Fallback WebView code for iOS 8 and earlier
          console.error(url, error);
          navigate('WebView', { title: navData.title, url: url })
        });
    } else {
      url = "http://drive.google.com/viewerng/viewer?embedded=true&url=" + url;
      navigate('WebView', { title: navData.title, url: url })
    }
  }

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    
  },
  slide: {
    backgroundColor: 'white'
  },
  text: {
    fontFamily: 'HelveticaNeue-Light',
  },
  img: {
    resizeMode: 'cover',
    width: 'auto',
    height: '100%',
  },
  pagination: {
    bottom: 65,
  },

  row: {
    padding: 6,
    marginBottom: 1,
    backgroundColor: '#fff',
  },

  h1: {
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 26,
    color: '#000',
    margin: 4,
  },

  lessons: {
    paddingBottom: 50,
  },

});

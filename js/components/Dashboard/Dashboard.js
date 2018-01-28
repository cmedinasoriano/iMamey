/**
 * iMamey
 * 
 * @flow
 */

import React, { Component } from 'react';
import {
  Animated,
  AppRegistry,
  Button,
  Easing,
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
import Orientation from 'react-native-orientation';

import Firebase from 'firebase';
import moment from 'moment';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from './../../../resources/fonts/selection.json';
import ImageLoader from './../ImageLoader/ImageLoader';


const Icon = createIconSetFromIcoMoon(icoMoonConfig);

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const dashboardItemsPerRow = Math.min(4, Math.floor(screenWidth / 160));
const dashboardItemMargin = 1;
const dashboardItemSize = screenWidth/dashboardItemsPerRow-dashboardItemMargin*2;

const AnimatedZero = new Animated.Value(0);

export default class IMameyDashboardView extends Component {

  static navigationOptions = {
    title: 'Utilidades',
  };

  static dashboardItems;

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };

    if (!this.database) {
      this.database = Firebase.database();
    }

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

    // Reference to database snapshots for last message info
    this.itemsRef = this.database
      .ref('Production/resources')

    // Query database for links
    this.itemsRef.once('value', dataSnapshot => {
      // abandon promise if object was destroyed due to exiting tab while loading
      if(!this.refs || !this.refs.ListView) return;

      IMameyDashboardView.dashboardItems = [];
      this.animatedValue = [];
      this.arr = [];

      // Iterate through all message dashboardItems, format and add to list
      dataSnapshot.forEach(item => {
        // Get item value
        let value = item.val();

        // Push new formatted item to list data array
        IMameyDashboardView.dashboardItems.push({
          title: value.title,
          uri: value.uri,
          nav: value.nav,
          icon: value.icon,
        });
      });

      // Push this static item to the list (not from server)
      IMameyDashboardView.dashboardItems.push({
        title: 'Lecciones Bíblicas',
        uri: null,
        nav: 'Lessons',
        icon: 'https://firebasestorage.googleapis.com/v0/b/imamey-107f8.appspot.com/o/images%2FLibrary.png?alt=media&token=234c79ec-0b89-409b-9fba-4aa9e5a9338f',
      });

      // Sort items by title
      IMameyDashboardView.dashboardItems.sort(function(a, b){ 
        if(a.title < b.title) return -1;
        if(a.title > b.title) return 1;
        return 0;
      });

      for(var i=0; i<IMameyDashboardView.dashboardItems.length; i++) {
        this.arr.push(i);
        this.animatedValue[i] = new Animated.Value(0)
      }
      
      this.animate();

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(IMameyDashboardView.dashboardItems)
      });

    }).catch((error) => console.log(error));
  }

  animate () {
    
    const animations = this.arr.map((index) => {
      
      return Animated.timing(
        this.animatedValue[index],
        {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
        }
      )
    })
    Animated.stagger(100, animations).start()
  }

  render() {
    return(
      <View style={styles.container} >
        <StatusBar barStyle='default' />

        <View style={styles.statusBar} ></View>

        <ListView
          enableEmptySections
          scrollEnabled
          dataSource={this.state.dataSource}
          scrollEventThrottle={1}
          renderRow={this.renderRow.bind(this)}
          contentContainerStyle={styles.dashboard}
          ref='ListView' />
      </View>
    );
  }

  renderRow(rowData, sectionId, rowId) {

    const { navigate } = this.props.navigation;
    // alternate color also per row (only for even rows) (red, blue : blue, red : red, blue ...)
    const alternateRow = dashboardItemsPerRow%2 ? 0 : Math.floor(rowId/2);

    var val = this.animatedValue[rowId];

    return (
      <Animated.View style={[styles.row, {opacity: val, transform: [{scale: val}]}]}>
        <TouchableHighlight 
          // key={rowId}
          onPress={() => {
            if(rowData.uri) {
              this.openURL(rowData.uri, rowData);
            } else {
              navigate(rowData.nav, { title: rowData.title })
            }
          }}
          style={[styles.row, {width: '100%', height: '100%',}]}
          underlayColor='#f0f0f0'
          activeOpacity={1}
          >
          <View>
            <ImageLoader source={{uri: rowData.icon }} loadingSource={require('./../../../resources/images/Picture.png')} style={[styles.icon, {display: 'flex'}]} />
            <Text 
              style={[styles.h1, styles.text, styles.iconText, {textAlign: 'center',}, {color: ((Number(rowId)+alternateRow)%2 ? '#FC5185' : '#2794EB')}]}
            >{rowData.title}</Text>
          </View>
        </TouchableHighlight>
      </Animated.View>
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
      navigate('WebView', { title: navData.title, url: url })
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  wrapper: {
    
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

  dashboard: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBottom: 50,
  },
  row: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',

    width: dashboardItemSize,
    height: dashboardItemSize,
    margin: dashboardItemMargin,
    backgroundColor: '#fff',
  },

  h1: {
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 22,
  },

  icon: {
    width: 80, 
    height: 80,
    alignSelf: 'center',
    marginBottom: 0, 
  },

  iconText: {
    
  },

  box: {
    transform: [{scale: 1}],
  },

  statusBar: {
    height: 20,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#CCCCCC99',
    borderBottomWidth: 1,
  },


});

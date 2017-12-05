/**
 * iMamey
 * 
 * @flow
 */

'use strict';

import React, { Component } from 'react';
import {
  Animated,
  AppRegistry,
  Easing,
  Image,
  ListView,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';

import Orientation from 'react-native-orientation';
import Dimensions from 'Dimensions';

import FCM, {
  FCMEvent,
  NotificationType,
  WillPresentNotificationResult,
  RemoteNotificationResult
} from 'react-native-fcm';

import Firebase from 'firebase';

import RefreshIndicator from './RefreshIndicator'
// import { styles } from './styles/styles';

// const { screenWidth, screenHeight } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const MIN_PULLDOWN_DISTANCE = -120;

export default class IMameyMessagesView extends Component {
  refreshing = false;
  refresherHeight = 0;
  readyToRefresh = false;
  hiding = false;
  lastNotificationTimestamp = 0;
  refresherTimeout = null;

  _onLayout = (event) => {
    this.setState({
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      canScroll: true,
      scrollY: new Animated.Value(0),
      progress: new Animated.Value(0),
    };

    this.items = [];

    if (!this.database) {
      this.database = Firebase.database();
    }

    // console.error(this.state.dataSource)
    //console.error(styles, styles.navBar, StyleSheet.flatten(styles.navBar));
  }

  componentWillMount() {
    FCM.setBadgeNumber(0);
    Orientation.lockToPortrait();
  }

  componentDidMount() {
    this.doRefresh();

    // this.state.scrollY.addListener((value) => this.handleScroll(value));
    this.state.scrollY.addListener((value) => {
      this.handleScroll(value);
    });

  }

  componentWillUnmount() {
    this.state.scrollY.removeAllListeners()
    clearTimeout(this.refresherTimeout);
  }

  handleRelease() {
    if (this.state.scrollY._value <= MIN_PULLDOWN_DISTANCE) {
      // if (this.state.readyToRefresh) {

      this.doRefresh();
    }
    return this.setState({ readyToRefresh: false });
  }

  handleScroll(pullDownDistance) {
    var height = Math.max(0, -pullDownDistance.value);
    
    this.setState({ refresherHeight: height });
  }

  lockScroll() {
    this.setState({ canScroll: false });
  }

  unlockScroll() {
    this.setState({ canScroll: true });
  }

  showRefresher() {
    // this.setState({ refreshing: true });
    this.refreshing = true;

    if(Platform.OS == 'ios') {
      this.refs.PTRListView.scrollTo({ y: MIN_PULLDOWN_DISTANCE + 40 });
      this.lockScroll();
      this.refs.RefresherView.backgroundAnimationStart();
    }
  }

  hideRefresher() {
    this.refreshing = false;
    this.setState({ refreshing: false, hiding: false });

    if(Platform.OS == 'ios') {
      this.refs.PTRListView.scrollTo({ y: 0 });
      this.unlockScroll();
      this.refs.RefresherView.backgroundAnimationStop();
    }
  }

  doRefresh() {
    this.showRefresher();

    this.refresherTimeout = setTimeout(() => {
      this.hideRefresher();

      // TODO: Show Toaster timeout message here
      
    }, 10000);

    // Reference to database snapshots for last message info
    this.itemsRef = this.database
      .ref('notifications/snapshots/news')

    // Query database for last notification timestamp
    this.itemsRef.once('value', dataSnapshot => {
      // abandon promise if object was destroyed due to exiting tab while loading
      if(!this.refs || !this.refs.PTRListView) return;

      // Get result value
      let value = dataSnapshot.val();

      // Store last notification timestamp from server, if not registered store default value
      let lastTimestamp = value.timestamp ? value.timestamp : 0;

      // If last notification timestamp locally is older than server's
      if (this.lastNotificationTimestamp < lastTimestamp) {
        // Store latest timestamp from server
        this.lastNotificationTimestamp = lastTimestamp;
        
        // Reference to database messages
        this.itemsRef = this.database
          .ref('notifications/messages/news')
          .limitToLast(1000)
          .orderByChild('timestamp');

        // Query database for all messages at once (for iteration)
        this.itemsRef.once('value', dataSnapshot => {

          // abandon promise if object was destroyed due to exiting tab while loading
          if(!this.refs || !this.refs.PTRListView) return;

          // Clear items array before filling it again
          this.items = [];

          // Iterate through all message items, format and add to list
          dataSnapshot.forEach(item => {
            // Get item value
            let value = item.val();

            // Push new formatted item to list data array
            this.items.unshift({
              id: value.key,
              time: this.getTimeFrom(value.timestamp),
              date: this.getDateFrom(value.timestamp),
              title: value.title,
              text: value.message
            });
          });

          // Refresh state's dataSource after all items were added
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.items)
          });

          this.hideRefresher();
          clearTimeout(this.refresherTimeout);

        });
      } else {
        this.hideRefresher();
        clearTimeout(this.refresherTimeout);
        // TODO: Show Toaster nothing to update message here
      }
      
      this.props.parent.hideMessageBadge();
    });
  }

  getTimeFrom(timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    let date = new Date(timestamp);
    // Hours part from the timestamp
    let hours = date.getHours();
    // Minutes part from the timestamp
    let minutes = '0' + date.getMinutes();

    // Will display time in 10:30:23 format
    let formattedDate = (hours == 0 ? 12 : hours % 12) + ':' + minutes.substr(-2) + (hours > 12 ? ' PM' : ' AM');

    return formattedDate;
  }

  getDateFrom(timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    let date = new Date(timestamp);
    // Month name from timestamp
    let month = monthNames[date.getMonth()];
    // Day of the month
    let day = date.getDate();
    // Seconds part from the timestamp
    let year = date.getFullYear();

    // Will display date in Month day, year format
    let formattedDate = month + ' ' + day + ', ' + year;

    return formattedDate;
  }

  render() {

    const event = Animated.event([
      {
        nativeEvent: {
          contentOffset: {
            y: this.state.scrollY
          }
        }
      }
    ]);

    const ratio = this.state.scrollY._value / MIN_PULLDOWN_DISTANCE;
    const alpha = Math.max(0, Math.min(ratio*2, 1));
    const progress = (this.refreshing) ?
      1 :
      Math.max(0, Math.min(ratio, 1));

    const height = Math.max(0, -this.state.scrollY._value);

    const refresherPosition = this.state.scrollY.interpolate({
      inputRange: [MIN_PULLDOWN_DISTANCE, 0],
      outputRange: [-MIN_PULLDOWN_DISTANCE / 2, 0],
    });

    const refresherHeight = this.state.scrollY.interpolate({
      inputRange: [MIN_PULLDOWN_DISTANCE, 0],
      outputRange: [-MIN_PULLDOWN_DISTANCE, 0],
    });

    const interpolatedRotateClockwise = this.state.scrollY.interpolate({
      inputRange: [MIN_PULLDOWN_DISTANCE * .66, 0],
      outputRange: ['0deg', '-90deg'],
      extrapolate: 'clamp',
    });

    const interpolatedTranslateUp = this.refreshing ? -10 :
      this.state.scrollY.interpolate({
        inputRange: [MIN_PULLDOWN_DISTANCE, MIN_PULLDOWN_DISTANCE / 2],
        outputRange: [-10, 3],
        extrapolate: 'clamp',
      });

    const interpolatedTranslateDown = this.refreshing ? 10 :
      this.state.scrollY.interpolate({
        inputRange: [MIN_PULLDOWN_DISTANCE, MIN_PULLDOWN_DISTANCE / 2],
        outputRange: [10, 0],
        extrapolate: 'clamp',
      });


    const refreshIndicator = (
      Platform.OS == 'ios' ? 
        <View style={styles.fillParent}>
          <RefreshIndicator
            height={height}
            maxHeight={-MIN_PULLDOWN_DISTANCE}
            
            refreshing={this.refreshing}
            hidinging={this.state.hiding}

            clockwiseRotation={interpolatedRotateClockwise}
            upTranslation={interpolatedTranslateUp}
            downTranslation={interpolatedTranslateDown}
            
            position={refresherPosition}
            opacity={alpha}
            progress={progress}
            ref='RefresherView'
          />
        </View>
        : null
    );

    const refreshControl = (
      Platform.OS == 'ios' ? 
        null : 
        <RefreshControl refreshing={this.refreshing} onRefresh={() => this.doRefresh()} />
    );

    return (

        <View style={styles.container} onLayout={this._onLayout}>

          <StatusBar barStyle='light-content' />

          <Image
            source={require('../../resources/images/mists.jpg')}
            style={[styles.navBar, { width: screenWidth, }]}>
            <Text style={[styles.navBarHeader, styles.text]}>Mensajes</Text>
          </Image>

          {refreshIndicator}

          <ListView style={{ }}
            dataSource={this.state.dataSource}
            scrollEventThrottle={1}
            scrollEnabled={this.state.canScroll}
            onScroll={event}
            renderRow={this.renderRow.bind(this)}
            onResponderRelease={this.handleRelease.bind(this)}

            contentContainerStyle={[styles.messages]}
            refreshControl={refreshControl} 
            ref='PTRListView' />

        </View>
      );

  }

  renderRow(rowData, sectionId, rowId) {
    return (
      <View key={rowId} style={[styles.row, (rowId != Object.keys(this.state.dataSource._dataBlob[sectionId]).length - 1) ? {} : {marginBottom: 0}]}>
        <Text style={[styles.h2, styles.text]}>{rowData.time}&nbsp;&nbsp;{rowData.date}</Text>
        <Text style={[styles.h1, styles.text]}>{rowData.title}</Text>
        <Text style={[styles.p, styles.text]}>{rowData.text}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  text: {
    fontFamily: 'HelveticaNeue-Light',
  },

  navBar: {
    flexDirection: 'row',
    paddingTop: 20,
    height: 64,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  navBarHeader: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 16,
  },

  navBarButton: {
    color: '#FFFFFF',
    textAlign: 'center',
    width: 64,
  },

  tabBar: {
    height: 50,
  },

  tabBarButton: {
    flex: 1,
  },

  row: {
    padding: 6,
    marginBottom: 6,
    backgroundColor: '#fff',
  },

  h1: {
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '500',
    color: '#333',
    margin: 4,
  },

  h2: {
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    color: '#666',
    margin: 4,
  },

  p: {
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    color: '#000',
    margin: 4,
  },

  fillParent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    bottom: 0,
  },

  logger: { 
    position: 'absolute',
    bottom: 0,
    maxHeight: 70,
    minHeight: 0,
    width: '100%',
    flex: 0,
    flexDirection: 'column',
  },

  messages: {
    paddingBottom: 50,
  },
  
});
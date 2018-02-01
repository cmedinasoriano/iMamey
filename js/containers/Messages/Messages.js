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

import RefreshIndicator from './../../components/RefreshIndicator/RefreshIndicator'
import styles from './styles';

const screenWidth = Dimensions.get('window').width;

export const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const MIN_PULLDOWN_DISTANCE = 120;

export default class Messages extends Component {
  refreshing = false;
  refresherHeight = 0;
  readyToRefresh = false;
  hiding = false;
  lastNotificationTimestamp = 0;
  refresherTimeout = null;

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      canScroll: true,
      refreshing: false,
      scrollY: new Animated.Value(0),
      progress: new Animated.Value(0),
    };

    this.items = [];

    if (!this.database) {
      this.database = Firebase.database();
    }
  }

  componentWillMount() {
    FCM.setBadgeNumber(0);
    Orientation.lockToPortrait();
  }

  componentDidMount() {
    this.doRefresh();
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
      this.setState({ refreshing: true, scrollTo: MIN_PULLDOWN_DISTANCE + 40 });
      this.lockScroll();
    }
  }

  hideRefresher() {
    this.refreshing = false;
    this.setState({ refreshing: false, hiding: false });

    if(Platform.OS == 'ios') {
      //this.refs.PTRListView.scrollTo({ y: 0 });
      //this.refs.RefresherView.backgroundAnimationStop();
      this.setState({ refreshing: false, scrollTo: 0 });
      this.unlockScroll();
    }
  }

  doRefresh() {
    this.showRefresher();

    // Set timeout for refresher
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
      const value = dataSnapshot.val();

      // Store last notification timestamp from server, if not registered store default value
      const lastTimestamp = value.timestamp ? value.timestamp : 0;

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
            const value = item.val();

            // Push new formatted item to list data array
            this.items.unshift({
              id: value.key,
              time: this.getTime(value.timestamp),
              date: this.getDate(value.timestamp),
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

  getTime(timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    const date = new Date(timestamp);
    // Hours part from the timestamp
    const hours = date.getHours();
    // Minutes part from the timestamp
    const minutes = '0' + date.getMinutes();

    // Will display time in 10:30:23 format
    const formattedDate = `${hours == 0 ? 12 : hours % 12}:${minutes.substr(-2)} ${(hours > 12 ? "PM" : "AM")}`;

    return formattedDate;
  }

  getDate(timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    const date = new Date(timestamp);
    // Month name from timestamp
    const month = monthNames[date.getMonth()];
    // Day of the month
    const day = date.getDate();
    // Seconds part from the timestamp
    const year = date.getFullYear();

    // Will display date in Month day, year format
    const formattedDate = `${month} ${day}, ${year}`;

    return formattedDate;
  }

  renderRow(rowData, sectionId, rowId) {
    return (
      <View key={rowId} style={[styles.row, (rowId != Object.keys(this.state.dataSource._dataBlob[sectionId]).length - 1) ? {} : {marginBottom: 0}]}>
        <Text style={[styles.time, styles.text]}>{rowData.time}&nbsp;&nbsp;{rowData.date}</Text>
        <Text style={[styles.title, styles.text]}>{rowData.title}</Text>
        <Text style={[styles.content, styles.text]}>{rowData.text}</Text>
      </View>
    );
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

    const refreshIndicator = (
      Platform.OS == 'ios' ? 
        <View style={styles.fillParent}>
          <RefreshIndicator
            refreshing={this.state.refreshing}
            progress={-this.state.scrollY._value / MIN_PULLDOWN_DISTANCE}
            height={MIN_PULLDOWN_DISTANCE}
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

          <StatusBar barStyle={'light-content'} />
          <Image
            source={require('./../../../resources/images/mists.jpg')}
            style={[styles.navBar, { width: screenWidth }]}>
            <Text style={[styles.navBarHeader, styles.text]}>Mensajes</Text>
          </Image>
      
          { refreshIndicator }

          <ListView
            dataSource={this.state.dataSource}
            scrollEventThrottle={100}
            scrollEnabled={this.state.canScroll}
            onScroll={event}
            renderRow={this.renderRow.bind(this)}
            onResponderRelease={this.handleRelease.bind(this)}
      
            contentContainerStyle={[styles.messages]}
            refreshControl={refreshControl}
             />
             
          </View>
        );
      }
    }

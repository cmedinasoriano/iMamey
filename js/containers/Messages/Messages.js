/**
 * iMamey
 *
 * @flow
 */

import React, { Component } from 'react';
import {
  Animated,
  Image,
  ListView,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
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

import RefreshIndicator from './../../components/RefreshIndicator/RefreshIndicator';

import styles from './styles';

const screenWidth = Dimensions.get('window').width;
export const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MIN_PULLDOWN_DISTANCE = 80;

export default class Messages extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      canScroll: true,
      refreshing: false,
      lastNotificationTimestamp: 0,
      scrollY: 0,
    };

    // Animated value for ListView's vertical scroll position 
    this.scrollY = new Animated.Value(0);

    // Animated event to bind scroll position to state.scrollY
    this.event = Animated.event(
      [{ nativeEvent: {
        contentOffset: { y: this.scrollY }
      }}]
    );

    // Singleton firebase
    this.database = this.database || Firebase.database();

    // Bind doRefresh function
    this.doRefresh = this.doRefresh.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.handleRelease = this.handleRelease.bind(this);
  }

  componentWillMount() {
    FCM.setBadgeNumber(0);
    Orientation.lockToPortrait();
  }

  componentDidMount() {

    this.scrollY.addListener((value) => {
      this.handleScroll(value);
    });

    this.doRefresh();
  }

  componentWillUnmount() {
    this.scrollY.removeAllListeners()
    clearTimeout(this.refresherTimeout);
  }

  handleRelease() {
    if (this.state.scrollY >= MIN_PULLDOWN_DISTANCE) {
      this.doRefresh();
    }
  }

  handleScroll(scrollY) {
    this.setState({
      scrollY: Math.max(0, -scrollY.value),
    });
  }

  /**
   * showRefresher - Updates state to show refresher
   *
   */
  showRefresher() {
    // If iOS
    if(Platform.OS === 'ios') {
      this.refs.ListViewRef.scrollTo({ y: -MIN_PULLDOWN_DISTANCE });
      // Set state to refreshing and scroll down
      this.setState({ refreshing: true, canScroll: false });
    } else {
      // Set state to refreshing
      this.setState({ refreshing: true });
    }
  }

  /**
   * hideRefresher - Updates refresh state to hide refresher
   *
   */
  hideRefresher() {
    // Clear refresherTimeout
    clearTimeout(this.refresherTimeout);

    // If iOS
    if (Platform.OS === 'ios') {
      this.refs.ListViewRef.scrollTo({ y: 0 });
      // Update state with new refresh state and enable scroll
      this.setState({ refreshing: false, canScroll: true });
    } else {
      // Otherwise update state with new refresh state
      this.setState({ refreshing: false });
    }
  }


  /**
   * clearRefresher - Hides the refresher
   *
   * @param {String} Message
   */
  clearRefresher(message) {
    // TODO: Show Toasters with message
    // Hide refresher
    this.hideRefresher();
  }

  /**
   * doRefresh - Check new messages and show refresher
   *
   */
  doRefresh() {
    // Shows refresher
    this.showRefresher();

    // Set timeout for refresher
    this.refresherTimeout = setTimeout(() => {
      this.hideRefresher();

      // TODO: Show Toaster timeout message here

    }, 10000);

    // Check and retrieve new messages
    this.checkForNewMessages();
  }

  /**
   * checkForNewMessages - Checks and retrieves new messages
   *
   */
  async checkForNewMessages() {
    const ref = this.database.ref('notifications/snapshots/news');
    const { hideMessageBadge } = this.props.parent;
    const { lastNotificationTimestamp } = this.state;

    try {
      const snapshot = await ref.once('value');
      // Get result value
      const value = snapshot.val();
      // Store last notification timestamp from server, if not registered store default value
      const lastTimestamp = value.timestamp || 0;

      // If the last notification's timestamp is after our
      // stored notification timestamp (There are new messages)
      if (lastNotificationTimestamp < lastTimestamp) {
        // Get new messages with a limit specified
        this.getMessages(100);

        // Update lastNotificationTimestamp
        this.setState({ lastNotificationTimestamp: lastTimestamp });
      } else {
        // Clear refresher
        this.clearRefresher('No new messages found.');
      }
      // Hide message badge
      hideMessageBadge();
    } catch (e) {
      // Print error message
      console.log(e);
      // Clear refresher and send error message
      this.clearRefresher(e.message);
    }
  }


  /**
   * getMessages - Retrieves messages from database
   *
   * @param {Number} messageLimit Limit of maximum downloaded messages from database
   *
   */
  async getMessages(messageLimit) {
    // TODO: Database
    // Add child of reversedTimestamp with value of negative timestamp
    // Change orderByChild to be reversedTimestamp
    // Change reduce function below to map

    // Reference to database messages
    const ref = this.database
      .ref('notifications/messages/news')
      .orderByChild('timestamp')
      .limitToLast(messageLimit);

    try {
      // Get messages from database
      const dataSnapshot = await ref.once('value');

      // Holds messages
      let messages = [];

      // For each message object
      dataSnapshot.forEach(snapshot => {
        // Get snapshot value
        const item = snapshot.val();

        const message = {
          id: snapshot.key,
          time: this.getTime(item.timestamp),
          date: this.getDate(item.timestamp),
          title: item.title,
          text: item.message,
        };

        messages = [message, ...messages];
      });

      // Refresh state's dataSource after all messages were retrieved
      this.setState({ dataSource: this.state.dataSource.cloneWithRows(messages)});

      // Hide refresher
      this.hideRefresher();
    } catch (e) {
      console.log(e);
    }
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


  /**
   * renderRow - Render messages as rows
   *
   * @param {Object} rowData
   * @param {Number} sectionId
   * @param {Number} rowId 
   *
   * @return {View}
   */
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

    const { refreshing, canScroll, dataSource, scrollY } = this.state;

    // Custom Refresh Indicator for iOS
    const refreshIndicator = (
      <View style={styles.fillParent}>
        <RefreshIndicator
          refreshing={refreshing}
          animationProgress={scrollY}
          animationMaxProgress={MIN_PULLDOWN_DISTANCE}
        />
      </View>
    );

    // Refresh control for Android
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={this.doRefresh} />;

    // Check if device is iOS
    const isIOS = Platform.OS === 'ios';

    return (

      <View style={styles.container} >
        <StatusBar barStyle={'light-content'} />
        <Image
          source={require('./../../../resources/images/mists.jpg')}
          style={[styles.navBar, { width: screenWidth }]}
        >
          <Text style={[styles.navBarHeader, styles.text]}>Mensajes</Text>
        </Image>

        { (isIOS) && refreshIndicator }

        <ListView
          onScroll={this.event}
          dataSource={dataSource}
          scrollEventThrottle={100}
          scrollEnabled={canScroll}
          refreshControl={(isIOS) ? null : refreshControl}
          renderRow={this.renderRow}
          contentContainerStyle={[styles.messages]}
          onResponderRelease={this.handleRelease}
          ref='ListViewRef'
        />
      </View>
    );
  }
}

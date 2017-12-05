/**
 * iMamey
 * 
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  AppState,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  WebView,
} from 'react-native';
import SafariView from "react-native-safari-view";
import Orientation from "react-native-orientation";
import Dimensions from 'Dimensions';
import Immersive from 'react-native-immersive';

import FCM, {
  FCMEvent,
  NotificationType,
  WillPresentNotificationResult,
  RemoteNotificationResult
} from 'react-native-fcm';

import Firebase from 'firebase';
export const firebaseConfig = {
  apiKey: 'AIzaSyCockuLGkrlBZ45D2mhDlOub8yXm_DNHj0',
  authDomain: 'https://imamey-107f8.firebaseio.com',
  databaseURL: 'https://imamey-107f8.firebaseio.com',
  storageBucket: 'https://imamey-107f8.firebaseio.com',
  projectId: 'imamey-107f8',
  messagingSenderId: '844302213500',
};

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from '../../resources/fonts/selection.json';

import IMameySlidesView from '../home/IMameySlidesView';
import IMameyCalendarView from '../calendar/IMameyCalendarView';
import IMameyMessagesView from '../messages/IMameyMessagesView';
import IMameyNavigatorView from '../dashboard/IMameyNavigatorView';

import NavigationBarAndroid from '../../custom_modules/NavigationBarAndroid';


const Icon = createIconSetFromIcoMoon(icoMoonConfig);

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Tab = {
  home: 0,
  blog: 1,
  calendar: 2,
  messages: 3,
  dashboard: 4
}

export default class IMameyTabsView extends Component {

  appState = AppState.currentState;

  constructor(props) {
    super(props);

    Firebase.initializeApp(firebaseConfig);

    this.state = {
      currentTab: Tab.home,
      blogUrl: "",
      badgeVisible: false,
    };

    if (Platform.OS == 'ios') {
      let showBlog = SafariView.addEventListener(
        "onShow",
        () => {
          StatusBar.setBarStyle("default");
          Orientation.unlockAllOrientations();
        }
      );

      let dismissBlog = SafariView.addEventListener(
        "onDismiss",
        () => {
          if (this.state.currentTab == Tab.blog) {
            this.setState({ currentTab: this.prevTab });
            Orientation.lockToPortrait();
          }
        }
      );
    }

  }


  componentWillMount() {
  }


  componentDidMount() {
    if( Platform.OS == 'android' ) {
      Immersive.on();
      Immersive.setImmersive(true);
    }

    // Ask user for push notification permissions
    FCM.requestPermissions();

    // Connect to FCM and get Token
    FCM.getFCMToken()
      .then(token => {
        console.log("FCM Token: " + token);

        const topicToSubscribe = '/topics/news'

        if (token) {
          FCM.subscribeToTopic(topicToSubscribe);
        } else {
          this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
            console.log("TOKEN (refreshToken)", token);
            FCM.subscribeToTopic(topicToSubscribe);
          });
        }
      }).catch(error => {
        console.log(error);
      });

    // This is the correct implementation but appears to have a bug
    FCM.getInitialNotification().then(notification => {
      // usually there is no notification; don't act in those scenarios
      if(!notification || (Platform.OS === 'android' && !notification.body)) {
          return;
      }

      console.log("INITIAL NOTIFICATION", notification)

      this.showMessageBadge();
      this.goToTab(Tab.messages);
      
    }).catch(error => {
      console.log(error);
    });
    // --------------------------------------------------------------------

    this.notificationListner = FCM.on(FCMEvent.Notification, notification => {

      console.log("Notification", notification);

      if (Platform.OS === 'ios') {
        //optional
        //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
        //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
        //notification._notificationType is available for iOS platfrom
        switch (notification._notificationType) {

          case NotificationType.Remote:
            notification.finish(RemoteNotificationResult.NewData); //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
            break;
          case NotificationType.NotificationResponse:
            notification.finish();
            break;
          case NotificationType.WillPresent:
            if (this.state.currentTab == Tab.messages) {
              this.refs.MessagesView.doRefresh();
              notification.finish(WillPresentNotificationResult.None);
            } else {
              this.showMessageBadge();
              notification.finish(WillPresentNotificationResult.All); //other types available: WillPresentNotificationResult.None
            }
            break;
        }
      } else {
        if(notification.body) {
          this.showMessageBadge();

          if (this.state.currentTab == Tab.messages || notification.opened_from_tray) {
            this.refs.MessagesView.doRefresh();
          } else {
            this.goToTab(Tab.messages);
          }

          if(notification.opened_from_tray) {
            if (this.state.currentTab == Tab.messages) {
              this.refs.MessagesView.doRefresh();
            } else {
              this.goToTab(Tab.messages);
            }
          } else {
            if (this.state.currentTab == Tab.messages) {
              this.refs.MessagesView.doRefresh();
            } 
          }
        }
      }
    });

  }


  componentWillUnmount() {
    this.notificationListner.remove();
    this.refreshTokenListener.remove();
  }


  onTabPressed1(event) {
    this.setState({ currentTab: Tab.home });
  }


  onTabPressed2(event) {

    if (this.state.currentTab == Tab.blog) return;

    this.prevTab = this.state.currentTab;
    this.setState({ currentTab: Tab.blog });

    const url = "http://imameyblog.wordpress.com";

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
          console.log(url, error);
          this.setState({ blogUrl: url })
        });
    } else if (Platform.OS == 'android') {
      this.setState({ blogUrl: url })
    }
  }


  onTabPressed3(event) {
    console.log('tab3');
    if (this.state.currentTab != Tab.calendar)
      this.goToTab(Tab.calendar);
  }


  onTabPressed4(event) {
    console.log('tab4');
    this.goToTab(Tab.messages);
  }


  onTabPressed5(event) {
    console.log('tab5');
    this.goToTab(Tab.dashboard);
  }


  goToTab(newTab) {
    if (this.state.currentTab == newTab) return;

    this.setState({ currentTab: newTab });
  }


  showMessageBadge() {
    this.setState({ badgeVisible: true });
  }


  hideMessageBadge() {
    this.setState({ badgeVisible: false });
  }


  renderContent() {
    switch (this.state.currentTab) {

      case Tab.home:
        return (<IMameySlidesView />);

      case Tab.blog:
        if (Platform.OS == 'ios') {
          return <View style={{ flex: 1 }} />;
        } else {
          return <WebView style={{ flex: 1 }} source={{ uri: this.state.blogUrl }} />;
        }

      case Tab.calendar:
        return (<IMameyCalendarView />);

      case Tab.messages:
        return (<IMameyMessagesView ref="MessagesView" parent={this} />);

      case Tab.dashboard:
        return (<IMameyNavigatorView />);

    }

    throw new Error(`Unknown tab ${this.state.currentTab}`);
  }

  render() {
    
    return (
      <View style={styles.container}>

        {this.renderContent()}

        <View style={styles.tabBar}>

          <View style={styles.tabBarButton}>
            <TouchableHighlight style={[styles.iconTextWrapper, {backgroundColor: 'transparent'}]} onPress={(event) => this.onTabPressed1()} underlayColor='transparent' >
              <View style={{ height: '100%' }}>
                <Icon name="im-icon-home" style={[styles.icon, this.state.currentTab == Tab.home ? styles.selected : null]} underlayColor='transparent' />
                <Text style={[styles.iconText, this.state.currentTab == Tab.home ? styles.selected : null]}>Inicio</Text>
              </View>
            </TouchableHighlight>
          </View>

          <View style={styles.tabBarButton}>
            <TouchableHighlight style={styles.iconTextWrapper} onPress={(event) => this.onTabPressed2()} underlayColor='transparent' >
              <View style={{ height: '100%' }}>
                <Icon name="im-icon-book-open" style={[styles.icon, this.state.currentTab == Tab.blog ? styles.selected : null]} />
                <Text style={[styles.iconText, this.state.currentTab == Tab.blog ? styles.selected : null]}>Blog</Text>
              </View>
            </TouchableHighlight>
          </View>

          <View style={styles.tabBarButton}>
            <TouchableHighlight style={styles.iconTextWrapper} onPress={(event) => this.onTabPressed3()} underlayColor='transparent' >
              <View style={{ height: '100%' }}>
                <Icon name="im-icon-calendar" style={[styles.icon, this.state.currentTab == Tab.calendar ? styles.selected : null]} />
                <Text style={[styles.iconText, this.state.currentTab == Tab.calendar ? styles.selected : null]}>Calendario</Text>
              </View>
            </TouchableHighlight>
          </View>

          <View style={styles.tabBarButton}>
            <TouchableHighlight style={styles.iconTextWrapper} onPress={(event) => this.onTabPressed4()} underlayColor='transparent' >
              <View style={{ height: '100%' }}>
                <Icon name="im-icon-chat" style={[styles.icon, this.state.currentTab == Tab.messages ? styles.selected : null]} />
                <Text style={[styles.iconText, this.state.currentTab == Tab.messages ? styles.selected : null]}>Mensajes</Text>

                <View style={{ display: this.state.badgeVisible ? 'flex' : 'none', width: '100%', height: '100%', position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ borderRadius: 10, backgroundColor: '#2794EB', minWidth: 19, minHeight: 19, borderWidth: 1, borderColor: '#ffffff', left: 20, bottom: 12, flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '500', fontSize: 12, textAlign: 'center', backgroundColor: 'transparent', paddingHorizontal: 4, bottom: 1 }}>!</Text>
                  </View>
                </View>

              </View>
            </TouchableHighlight>
          </View>

          <View style={styles.tabBarButton}>
            <TouchableHighlight style={styles.iconTextWrapper} onPress={(event) => this.onTabPressed5()} underlayColor='transparent' >
              <View style={{ height: '100%' }}>
                <Icon name="im-icon-dashboard" style={[styles.icon, this.state.currentTab == Tab.dashboard ? styles.selected : null]} />
                <Text style={[styles.iconText, this.state.currentTab == Tab.dashboard ? styles.selected : null]}>Utilidades</Text>
              </View>
            </TouchableHighlight>
          </View>

        </View>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EEEF',
  },

  navBar: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    backgroundColor: 'transparent',
    resizeMode: 'cover',
  },

  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#EEEEEE'
  },

  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', 
    bottom: 0,
    height: 50,
    width: '100%',
    backgroundColor: '#EDEDED',
    borderTopWidth: 1,
    borderColor: '#CCCCCC99',
    opacity: .97,
  },
  tabBarButton: {
    flex: 1,
    maxWidth: 83, 
  },
  icon: {
    flex: 2,
    width: '100%',
    textAlign: 'center',
    borderRadius: 0,
    fontSize: 24,
    color: '#929292',
    padding: 'auto',
    lineHeight: 35,
  },
  iconText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingBottom: 1,
  },
  iconTextWrapper: {
    width: '100%',
  },
  selected: {
    color: '#2794EB',
  },
});

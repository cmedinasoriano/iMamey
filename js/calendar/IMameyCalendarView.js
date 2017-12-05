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
  StatusBar,
  StyleSheet,
  Text,
  TouchableElement,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Orientation from 'react-native-orientation';
import Dimensions from 'Dimensions';
import moment from 'moment';

import DeviceInfo from 'react-native-device-info';

import Calendar from "./react-native-calendar";

import * as AddCalendarEvent from 'react-native-add-calendar-event';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const navBarHeight = 64;

export default class IMameyCalendarView extends Component {

  static dayNames = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];

  static monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  events = [];
  lastEventsUpdateDate = moment(0);

  dayNamesAbrev = IMameyCalendarView.dayNames.slice().replaceArray(
    /(.{3}).*/gi,
    function (match, capture) { return capture.toUpperCase(); }
  );

  constructor(props) {
    super(props);

    this.today = moment();
    var currentDate = moment().startOf('month');

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      date: currentDate,
      selectedDate: this.today,
      today: this.today,
      eventDates: [],
    };

    Object.keys(DeviceInfo).forEach(function (key, value) {
      console.log(key + ': ' + DeviceInfo[key]());
    });

    this.updateEvents();
  }

  componentWillMount() {
    Orientation.lockToPortrait();
  }
  componentWillUnmount() {
  }

  componentDidMount() {

  }

  onDateChange(date) {
    this.setState({
      date: date,
      today: moment(),
    });
  }

  onToday(event) {
    const today = moment();
    this.setState({
      date: today,
      selectedDate: today,
      today: today,
    });

    setTimeout(() => this.updateEvents(), 1);
  }

  onCalendarEvent(rowData, event) {
    
    const eventConfig = {
      title: rowData.title,
      startDate: rowData.startDate,
      endDate: rowData.endDate,
      location: rowData.location,
      notes: rowData.description,
      // and other options 
    };

    AddCalendarEvent.presentNewCalendarEventDialog(eventConfig)
      .then(eventId => {
        //handle success (receives event id) or dismissing the modal (receives false) 
        if (eventId) {
          console.warn(eventId);
        } else {
          console.warn('dismissed');
        }
      })
      .catch((error: string) => {
        // handle error such as when user rejected permissions 
        console.warn(error);
      });
  }

  onTouchNext(event) {
    this.onDateChange(event);
  }

  onTouchPrev(event) {
    this.onDateChange(event);
  }

  onSwipeNext(event) {
    this.onDateChange(event);
  }

  onSwipePrev(event) {
    this.onDateChange(event);
  }

  onDateSelect(date) {
    let selected = moment(date);

    this.setState({
      selectedDate: selected,
      today: moment(),
    });

    setTimeout(() => this.updateEvents(), 1);
  }

  shouldUpdate() {
    let timeInterval = moment().diff(this.lastEventsUpdateDate, 'seconds');

    return (timeInterval > 1800)
  }

  updateEvents() {
    const kAPIKey = "AIzaSyCS8cT1pRQ9VYtRm6wFGHmSKlhUjO4w12k";
    const kCalendarID = '2job3b0otu73ucl0e3khrt7dp0@group.calendar.google.com';

    if (this.shouldUpdate()) {

      let startDate = moment().startOf('month');

      let minDate = moment(startDate).subtract(2, 'year');
      let maxDate = moment(startDate).add(2, 'year');

      let minDateString = minDate.format('YYYY-MM-DDT00:00:00-04:00');
      let maxDateString = maxDate.format('YYYY-MM-DDT00:00:00-04:00');

      let headers = {
        'X-Ios-Bundle-Identifier': DeviceInfo.getBundleId(),
      }

      let parameters = {
        key: kAPIKey,
        orderby: 'starttime',
        sortorder: 'ascending',
        futureevents: 'true',
        alt: 'json',
        singleEvents: 'true',
        timeMin: minDateString,
        timeMax: maxDateString,
      }

      let body = {
        method: 'GET',
        headers: headers,
      }

      let url = 'https://www.googleapis.com/calendar/v3/calendars/' + kCalendarID + '/events'
      let uri = url + '?' + Object.keys(parameters).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(parameters[k]);
      }).join('&');

      fetch(uri, body)
        .then((response) => response.json())
        .then((responseData) => {

          this.lastEventsUpdateDate = moment();

          console.log(responseData, responseData.items);
          this.parseGoogleCalendarResponseItems(responseData.items);

          this.refreshListToSelectedDate();

        })
        .catch((error) => {
          console.log(error);
        })
        .done();

    } else {
      this.refreshListToSelectedDate();
    }
  }

  refreshListToSelectedDate() {
    let selectedEvents = this.events[this.state.selectedDate.format('YYYYMMDD')]
    let dataSource = selectedEvents ? this.state.dataSource.cloneWithRows(selectedEvents) : this.state.dataSource.cloneWithRows([]);

    this.setState({
      dataSource: dataSource,
    });
  }

  parseGoogleCalendarResponseItems(responseItems) {

    this.events = [];
    let eventDates = [];

    responseItems.forEach((item) => {

      let startDate = moment(item.start.dateTime);
      let endDate = moment(item.end.dateTime);
      let key = startDate.format('YYYYMMDD');

      let title = item.summary;
      let description = item.description;
      let location = item.location;

      let day = startDate.day();

      let dayName = IMameyCalendarView.dayNames[day];
      let monthName = IMameyCalendarView.monthNames[startDate.month()];

      let startTime = startDate.format('h:mm A');
      let endTime = endDate.format('h:mm A');

      if (!this.events[key])
        this.events[key] = [];

      this.events[key].push({
        title: title,
        description: description,
        location: location,
        dayName: dayName,
        monthName: monthName,
        day: day,
        startTime: startTime,
        endTime: endTime,
        startDate: startDate.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
        endDate: endDate.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      })

      eventDates.push(key);

    });

    this.setState({
      eventDates: eventDates,
    })
  }


  render() {

    const month = IMameyCalendarView.monthNames[this.state.date.month()];
    const year = this.state.date.year();

    return (

      <View style={styles.container} onLayout={this._onLayout}>
        <StatusBar barStyle='light-content' />

        <Image
          source={require('../../resources/images/mists.jpg')}
          style={[styles.navBar, { width: screenWidth }]}>

          <View
            style={{ flexDirection: 'row', alignItems: 'center', height: '100%', width: '100%' }}
          >

            <TouchableHighlight
              onPress={(event) => this.onToday(event)}
              underlayColor='transparent'
              style={{ flexDirection: 'row', alignItems: 'center', height: navBarHeight, paddingTop: Platform.OS == 'ios' ? 10 : 0 }} >
              <Text style={[styles.navButton, styles.text, styles.navText]}>Ir a Hoy</Text>
            </TouchableHighlight>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: navBarHeight, paddingTop: Platform.OS == 'ios' ? 10 : 0 }} >
              <Text
                style={[styles.navBarHeader, styles.text, styles.navText, { width: '100%' }]}
                underlayColor='transparent' >
                {month} {year}
              </Text>
            </View>

            <TouchableHighlight
              onPress={(event) => this.refs.Calendar.onPrev()}
              underlayColor='transparent'
              style={{ flexDirection: 'row', alignItems: 'center', height: navBarHeight, paddingTop: Platform.OS == 'ios' ? 10 : 0 }} >
              <Image style={[styles.navButton]} source={require('../../resources/images/LeftChevron.png')} />
            </TouchableHighlight>

            <TouchableHighlight
              onPress={(event) => this.refs.Calendar.onNext()}
              underlayColor='transparent'
              style={{ flexDirection: 'row', alignItems: 'center', height: navBarHeight, paddingTop: Platform.OS == 'ios' ? 10 : 0 }} >
              <Image style={[styles.navButton]} source={require('../../resources/images/RightChevron.png')} />
            </TouchableHighlight>

          </View>

        </Image>

        <Calendar
          scrollEnabled              // False disables swiping. Default: False
          showEventIndicators        // False hides event indicators. Default:False

          currentMonth={this.state.date}   // Optional date to set the currently displayed month after initialization
          customStyle={calendarStyle} // Customize any pre-defined styles
          dayHeadings={this.dayNamesAbrev}               // Default: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
          eventDates={this.state.eventDates}       // Optional array of moment() parseable dates that will show an event indicator

          selectedDate={this.state.selectedDate.format('YYYYMMDD')} // Day to be selected
          startDate={this.state.date}      // The first month that will display. Default: current month

          today={this.state.today}          // Defaults to today
          weekStart={0} // Day on which week starts 0 - Sunday, 1 - Monday, 2 - Tuesday, etc, Default: 1

          onDateSelect={(date) => this.onDateSelect(date)}
          onTouchPrev={(date) => this.onTouchPrev(date)}
          onTouchNext={(date) => this.onTouchNext(date)}
          onSwipePrev={(date) => this.onSwipePrev(date)}
          onSwipeNext={(date) => this.onSwipeNext(date)}

          ref="Calendar"
        />

        <View style={[styles.eventsHeading]} >
          <Text style={[styles.text, {}]}>
            <Text style={[styles.text, { paddingHorizontal: 10 }]}>
              EVENTOS&nbsp;&nbsp;
            </Text>
            <Text style={[styles.text, { paddingHorizontal: 10, color: '#555' }]}>
              {this.state.selectedDate.format('D')}&nbsp;
              {IMameyCalendarView.monthNames[this.state.selectedDate.month()].substr(0, 3)}&nbsp;
              {this.state.selectedDate.format('YY')}
            </Text>
          </Text>
        </View>

        <ListView
          enableEmptySections
          dataSource={this.state.dataSource}
          scrollEventThrottle={1}
          scrollEnabled={this.state.canScroll}
          renderRow={this.renderRow.bind(this)}
          contentContainerStyle={styles.calendarList}
          ref='PTRListView' />

      </View>
    );
  }

  renderRow(rowData, sectionId, rowId) {
    return (
      <TouchableOpacity onPress={(event) => this.onCalendarEvent(rowData, event)} activeOpacity={0.5} >
        <View key={rowId} style={[styles.row, (rowId != Object.keys(this.state.dataSource._dataBlob[sectionId]).length - 1) ? {} : { marginBottom: 0 }]}>
          <Text style={[styles.h1, styles.text]}>{rowData.title}</Text>
          <Text style={[styles.h2, styles.text]}>⏰{rowData.startTime}-{rowData.endTime}&nbsp;&nbsp;📍{rowData.location}</Text>
          <Text style={[styles.p, styles.text]}>{rowData.description}</Text>
        </View>
      </TouchableOpacity>
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
    height: navBarHeight,
    backgroundColor: 'transparent',
  },

  navBarHeader: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 17,
  },

  navButton: {
    marginLeft: 14,
    marginRight: 14,
  },

  navText: {
    color: 'white',
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

  h2: {
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 22,
    color: '#666',
    margin: 4,
  },

  p: {
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
    color: '#000',
    margin: 4,
  },

  eventsHeading: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#D5DDDF',
    backgroundColor: 'white',
  },

  calendarList: {
    paddingBottom: 50,
  },

});

const calendarStyle = StyleSheet.create({
  calendarContainer: {
    backgroundColor: 'transparent',
  },

  calendarControls: {
    display: 'none',
  },

  day: {
    fontFamily: 'HelveticaNeue-Light',
    fontSize: 14,
    fontWeight: '400',
    alignSelf: 'center',
    color: '#364F6B',
    bottom: -4,
  },

  calendarHeading: {
    borderColor: '#D5DDDF',
    backgroundColor: 'white',
  },

  dayHeading: {
    fontFamily: 'HelveticaNeue-Light',
    fontSize: 13,
    fontWeight: '400',
    color: '#364F6B',
  },

  weekendHeading: {
    fontFamily: 'HelveticaNeue-Light',
    fontSize: 13,
    fontWeight: '400',
    color: '#364F6B',
  },

  weekendDayButton: {
    backgroundColor: '#dddddd',
    borderColor: '#E5EEEF',
  },

  weekendDayText: {
    color: '#364F6B',
  },

  selectedDayCircle: {
    backgroundColor: 'transparent',
  },

  currentDayText: {
    color: '#FC5185',
  },

  currentDayCircle: {
    backgroundColor: 'transparent',
  },

  dayButton: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5EEEF',
    justifyContent: 'center',
  },

  selectedDayButton: {
    backgroundColor: '#2794EB',
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5EEEF',
  },

  dayButtonFiller: {
    backgroundColor: '#fcfcfc',
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5EEEF',
    justifyContent: 'center',
  },

  eventIndicator: {
    backgroundColor: '#FC5185',
  },

  eventIndicatorFiller: {
    backgroundColor: 'transparent',
  },

  selectedEventIndicator: {
    backgroundColor: 'white',
  },
});


Array.prototype.replaceArray = function (regex, replace) {
  var replaceArray = this;

  for (var i = 0; i < replaceArray.length; i++) {
    replaceArray[i] = replaceArray[i].replace(regex, replace);
  }
  return replaceArray;
};
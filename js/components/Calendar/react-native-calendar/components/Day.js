import React, { Component, PropTypes } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import styles from './styles';

export default class Day extends Component {
  static defaultProps = {
    customStyle: {},
  }

  static propTypes = {
    caption: PropTypes.any,
    customStyle: PropTypes.object,
    filler: PropTypes.bool,
    event: PropTypes.object,
    isSelected: PropTypes.bool,
    isToday: PropTypes.bool,
    isWeekend: PropTypes.bool,
    onPress: PropTypes.func,
    showEventIndicators: PropTypes.bool,
  }

  dayCircleStyle = (isWeekend, isSelected, isToday, event) => {
    const { customStyle } = this.props;
    const dayCircleStyle = [
      styles.dayCircleFiller, 
      customStyle.dayCircleFiller
    ];

    if (isSelected) {
      if (isToday) {
        dayCircleStyle.push(
          styles.currentDayCircle, 
          customStyle.currentDayCircle
        );
      } else {
        dayCircleStyle.push(
          styles.selectedDayCircle, 
          customStyle.selectedDayCircle
        );
      }
    }

    if (event) {
      if (isSelected) {
        dayCircleStyle.push(
          styles.hasEventDaySelectedCircle, 
          customStyle.hasEventDaySelectedCircle, 
          event.hasEventDaySelectedCircle);
      } else {
        dayCircleStyle.push(
          styles.hasEventCircle, 
          customStyle.hasEventCircle, 
          event.hasEventCircle);
      }
    }
    return dayCircleStyle;
  }

  dayTextStyle = (isWeekend, isSelected, isToday, event) => {
    const { customStyle } = this.props;
    const dayTextStyle = [styles.day, customStyle.day];

    if (isToday && !isSelected) {
      dayTextStyle.push(styles.currentDayText, customStyle.currentDayText);
    } else if (isToday || isSelected) {
      dayTextStyle.push(styles.selectedDayText, customStyle.selectedDayText);
    } else if (isWeekend) {
      dayTextStyle.push(styles.weekendDayText, customStyle.weekendDayText);
    }

    if (event) {
      dayTextStyle.push(styles.hasEventText, customStyle.hasEventText, event.hasEventText)
    }
    return dayTextStyle;
  }

  render() {
    let { caption, customStyle } = this.props;
    const {
      filler,
      event,
      isWeekend,
      isSelected,
      isToday,
      showEventIndicators,
    } = this.props;
    
    return filler
    ? (
        <TouchableWithoutFeedback>
          <View style={[styles.dayButtonFiller, customStyle.dayButtonFiller]}>
            <View style={this.dayCircleStyle(false, false, false, true)}>
              <Text style={this.dayTextStyle(false, false, false, true)} />
            </View>

            <View style={[
                styles.eventIndicatorFiller,
                customStyle.eventIndicatorFiller,
                event && styles.eventIndicator,
                event && (isSelected ? customStyle.selectedEventIndicator : customStyle.eventIndicator),
                event && event.eventIndicator]}
              />
          </View>
        </TouchableWithoutFeedback>
      )
    : (
      <TouchableOpacity onPress={this.props.onPress}>
        <View style={[styles.dayButton, customStyle.dayButton, isSelected ? customStyle.selectedDayButton : (isWeekend ? styles.weekendDayButton : null)]}>
          <View style={this.dayCircleStyle(isWeekend, isSelected, isToday, event)}>
            <Text style={this.dayTextStyle(isWeekend, isSelected, isToday, event)}>{caption}</Text>
          </View>
          {(showEventIndicators||true) &&
            <View style={[
              styles.eventIndicatorFiller,
              customStyle.eventIndicatorFiller,
              event && styles.eventIndicator,
              event && (isSelected ? customStyle.selectedEventIndicator : customStyle.eventIndicator),
              event && event.eventIndicator]}
            />
          }
        </View>
      </TouchableOpacity>
    );
  }
}

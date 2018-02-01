import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Easing,
  Image
} from 'react-native'
import PropTypes from 'prop-types';

import Svg, {
  Rect,
  Circle,
  Path
} from 'react-native-svg';
import styles from './styles';

const { height, windowWidth } = Dimensions.get('window')

AnimatedPath = Animated.createAnimatedComponent(Path);

export default class RefreshIndicator extends Component {

  state = {
    height: this.props.height,
    progress: 0,
    ratio: new Animated.Value(0),
    scrollRatio: new Animated.Value(0),
  };

  images = {
    envelopeBack: require('./../../../resources/images/notification_envelope_back.png'),
    letter: require('./../../../resources/images/notification_letter.png'),
    envelopeFront: require('./../../../resources/images/notification_envelope_front.png')
  };

  static propTypes = {
    refreshing: PropTypes.bool,
    progress: PropTypes.number,
    height: PropTypes.number
  };

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  describeSVGArc(x, y, radius, startAngle, endAngle, pathWidth=1) {

    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = (endAngle - startAngle > 180) ? 1 : 0;

    const w2 = pathWidth * 2;
    return `M${start.x + w2 - .01} ${start.y + w2} A${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x + w2} ${end.y + w2}`;
  }

  lerp(a, b, n) {
    return (1 - n) * a + n * b;
  }

  backgroundAnimationStart() {
    this.bgAnimation = Animated.loop(Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1000,
    }));
    this.bgAnimation.start();
  }

  backgroundAnimationStop() {
    this.animatedValue.setValue(0);
    this.bgAnimation.stop();
  }

  startRefreshing(refreshing) {
    if (refreshing) {
      this.backgroundAnimationStart();
    } else {
      this.backgroundAnimationStop();
    }
  }

  componentWillMount() {
    this.animatedValue = new Animated.Value(0);
    this.progress = new Animated.Value(1);
  }

  componentDidMount() {

    setInterval(() => {
      if (this.state.progress != this.props.progress._value) {
        this.setState({
          progress: this.props.progress._value,
        })
      }
    }, 1);
  }

  componentWillReceiveProps(nextProps) {

    this.progress = new Animated.Value(nextProps.progress);
    // this.state.ratio = new Animated.Value(nextProps.progress);

    Animated.timing(this.state.scrollRatio, {
      toValue: nextProps.progress,
      easing: Easing.out(Easing.quad),
      duration: 200,
    }).start();

    Animated.timing(this.state.ratio, {
      toValue: nextProps.progress,
      easing: Easing.inOut(Easing.ease),
      duration: 200,
      delay: 50,
    }).start();

    if (nextProps.refreshing && nextProps.refreshing !== this.props.refreshing) {
      this.startRefreshing(nextProps.refreshing);
    }
  }

  render() {

    var color = this.animatedValue.interpolate({
      inputRange: [0, .001, .33, .66, 1],
      outputRange: ['rgba(255, 255, 255, .0)', 'rgba(255, 255, 0, .2)', 'rgba(0, 255, 255, .2)', 'rgba(255, 0, 255, .2)', 'rgba(255, 255, 0, .2)']
    });

    const progress = this.props.progress;
    const ratio = (this.refreshing) ?
      1 :
      Math.max(0, Math.min(progress, 1));
    const height = ratio * this.props.height;
    const opacity = Math.max(0, Math.min(ratio * 2, 1));

    const r = 17.5;
    const lineW = 2;
    const lineW2 = lineW * 2;

    const min = this.props.height;

    const refresherPosition = this.progress.interpolate({
      inputRange: [0, min],
      outputRange: [-min / 2, 0],
    });

    const refresherHeight = this.progress.interpolate({
      inputRange: [0, min],
      outputRange: [-min, 0],
    });

    const translateUp = this.lerp(2, -6, ratio);

    const animatedHeight = Animated.multiply(this.state.scrollRatio, new Animated.Value(this.props.height));

    const animatedCentering = Animated.multiply(animatedHeight, new Animated.Value(0.5));

    const animatedClockwiseRotation = this.state.scrollRatio.interpolate({
      inputRange: [0, 1],
      outputRange: ['-90deg', '0deg'],
      extrapolate: 'clamp',
    });

    let dRange = [];
    let iRange = [];
    let steps = 100;
    for (var i = 0; i<steps; i++){
        const ratio = i/(steps-1);
        dRange.push(this.describeSVGArc(r, r, r, 0, ratio*360, lineW));
        iRange.push(ratio);
    }

    var animatedPath = this.state.ratio.interpolate({
        inputRange: iRange,
        outputRange: dRange,
        extrapolate: 'clamp',
    })
    

    return (

      <Animated.View style={[styles.background, {
        backgroundColor: color,
        height: animatedHeight,
      }]}>

        <Animated.View style={[{
          backgroundColor: `red`,
          width: 0,
          opacity: opacity,
          transform: [
            { translateY: animatedCentering },
            { scale: 1 }
          ]
        }]} >
          <Svg height={'50'} width={'50'} style={{
            position: 'absolute',
            backgroundColor: 'transparent',
            transform: [
              { translateX: -(r+lineW2) },
              { translateY: -(r+lineW2) },
            ]
          }}>
            <Circle cx={r+lineW2} cy={r+lineW2} r={r} fill={'white'} />
            <AnimatedPath d={animatedPath} fill={'transparent'} stroke={'#c0c'} strokeWidth={lineW+1} />
          </Svg>

          <Animated.View
            style={[styles.notificationIcon,
            {
              transform: [
                { rotate: animatedClockwiseRotation },
                { translateX: -10 },
                { translateY: -10 },
                { scale: 0.5 }
              ]
            }
            ]}
          >

            <Animated.Image
              source={this.images.envelopeBack}
              style={[
                styles.icon, {
                  transform: [
                    { translateY: -translateUp },
                  ]
                }]}

            />
            <Animated.Image
              source={this.images.letter}
              style={[
                styles.icon, {
                  transform: [
                    { translateY: translateUp },
                  ]
                }]}
            />
            <Animated.Image
              source={this.images.envelopeFront}
              style={[
                styles.icon, {
                  transform: [
                    { translateY: -translateUp },
                  ]
                }]}
            />

          </Animated.View>
        </Animated.View>

      </Animated.View>

    );
  }
}

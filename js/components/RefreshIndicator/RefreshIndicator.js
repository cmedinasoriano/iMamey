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
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { describeSVGArc, polarToCartesian } from './../../helper/helper';
import styles from './styles';

AnimatedPath = Animated.createAnimatedComponent(Path);

export default class RefreshIndicator extends Component {
  static propTypes = {
    refreshing: PropTypes.bool,
    animationProgress: PropTypes.number,
    animationMaxProgress: PropTypes.number
  };

  state = {
    progress: new Animated.Value(0),
    ratio: new Animated.Value(0),
    scrollRatio: new Animated.Value(0),
  };

  images = [
    {
      icon: require('./../../../resources/images/notification_envelope_back.png'),
      animationDirection: -1,
    },
    {
      icon: require('./../../../resources/images/notification_letter.png'),
      animationDirection: 1,
    },
    {
      icon: require('./../../../resources/images/notification_envelope_front.png'),
      animationDirection: -1,
    },
  ];

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
  }

  componentWillReceiveProps(nextProps) {
    const { refreshing } = this.props;
    const { nextRefreshing } = nextProps;
    const progressRatio = nextProps.animationProgress / nextProps.animationMaxProgress;

    Animated.timing(this.state.scrollRatio, {
      toValue: progressRatio,
      easing: Easing.out(Easing.ease),
      duration: 300,
    }).start();

    Animated.timing(this.state.ratio, {
      toValue: progressRatio,
      easing: Easing.inOut(Easing.ease),
      duration: 200,
      delay: 50,
    }).start();

    if (nextRefreshing && nextRefreshing !== refreshing) {
      this.startRefreshing(nextRefreshing);
    }
  }


  /**
   * renderAnimatedImages - Description
   *
   * @param {type} translateY Description
   *
   * @return {type} Description
   */
  renderAnimatedImages(translateY) {
    const { envelopeBack, letter, envelopeFront } = this.images;

    return this.images.map((image, index) => {
      const direction = new Animated.Value(image.animationDirection);
      const translate = Animated.multiply(translateY, direction);

      return (
        <Animated.Image
          key={index}
          source={image.icon}
          style={[
            styles.icon,
            { transform: [{ translateY: translate }] },
          ]}
        />
      );
    })
  }

  render() {
    const { animationProgress, animationMaxProgress } = this.props;
    const { scrollRatio, ratio } = this.state;

    const animatedColor = this.animatedValue.interpolate({
      inputRange: [0, .001, .33, .66, 1],
      outputRange: ['rgba(255, 255, 255, .0)', 'rgba(255, 255, 0, .2)', 'rgba(0, 255, 255, .2)', 'rgba(255, 0, 255, .2)', 'rgba(255, 255, 0, .2)']
    });

    const animatedPosition = scrollRatio.interpolate({
      inputRange: [0, 1],
      outputRange: [0, animationMaxProgress / 2],
    });

    const animatedHeight = scrollRatio.interpolate({
      inputRange: [0, 1],
      outputRange: [0, animationMaxProgress],
    });

    const animatedClockwiseRotation = scrollRatio.interpolate({
      inputRange: [0, 1],
      outputRange: ['-90deg', '0deg'],
      extrapolate: 'clamp',
    });

    const animatedTranslate = ratio.interpolate({
      inputRange: [0, 1],
      outputRange: [2, -6],
      extrapolate: 'clamp',
    });

    const animatedOpacity = ratio.interpolate({
      inputRange: [0, .5],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });


    const r = 17.5;
    const lineW = 2;
    const lineW2 = lineW * 2;
    const steps = 80;

    let iRange = [];
    let dRange = [];

    for (let i = 0; i < steps; i++){
      const ratio = i/(steps-1);
      iRange.push(ratio);
      dRange.push(describeSVGArc(r, r, r, 0, ratio*360, lineW));
    }

    const animatedPath = ratio.interpolate({
      inputRange: iRange,
      outputRange: dRange,
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.background, {
        backgroundColor: animatedColor,
        height: animatedHeight,
      }]}>
        <Animated.View style={[{
          backgroundColor: `red`,
          width: 0,
          opacity: animatedOpacity,
          transform: [
            { translateY: animatedPosition }
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
            { this.renderAnimatedImages(animatedTranslate) }
          </Animated.View>
        </Animated.View>
      </Animated.View>
    );
  }
}

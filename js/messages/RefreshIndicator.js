import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Image
} from 'react-native'

import Svg, {
  Rect,
  Circle,
  Path
} from 'react-native-svg';

const { height, windowWidth } = Dimensions.get('window')

class RefreshIndicator extends Component {

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

  componentWillMount() {
    this.animatedValue = new Animated.Value(0);
    // this.bgAnimation = Animated.timing(this.animatedValue, {
    //   toValue: 1,
    //   duration: 1000,
    // })

    // // Animated.loop(this.bgAnimation, {
    // //   iterations: -1,
    // // });

    // Object.keys(this.bgAnimation).forEach(function (key, value) {
    //   console.log(key);
    // });

    // // console.log(this.bgAnimation.stop);

    // Animated.loop((this.bgAnimation = Animated.timing(this.animatedValue, {
    //   toValue: 1,
    //   duration: 1000,
    // })).start(), {
    //   iterations: -1,
    // })

    // this.bgAnimation = Animated.loop(Animated.timing(this.animatedValue, {
    //   toValue: 1,
    //   duration: 1000,
    // }), {
    //   iterations: -1,
    // })
    
  }

  componentDidMount() {


    // this.bgAnimation = Animated.timing(this.animatedValue, {
    //   toValue: 1,
    //   duration: 1000,
    // }).start();



    
    // this.backgroundAnimationStart();
    // this.bgAnimation.start();


    // this.bgAnimation.start(event => {
    //   if (event.finished) {
    //     this.animatedValue.setValue(0);
    //     //this.backgroundAnimationStart();
    //     this.bgAnimation.reset();
    //   }
    // });

    setInterval(() => {
      if (this.state.progress != this.props.progress._value) {
        this.setState({
          progress: this.props.progress._value,
        })
      }
    }, 1);
  }

  constructor(props) {
    super(props);

    this.state = {
      height: this.props.height,
      progress: 0,
    };
  }

  render() {
    var color = this.animatedValue.interpolate({
        inputRange: [0, .001, .33, .66, 1],
        outputRange: ['rgba(255, 255, 255, .0)', 'rgba(255, 255, 0, .2)', 'rgba(0, 255, 255, .2)', 'rgba(255, 0, 255, .2)', 'rgba(255, 255, 0, .2)']
    });

    const event = Animated.event([
      {
        nativeEvent: {
          contentOffset: {
            y: this.state.scrollY
          }
        }
      }
    ]);

    const progress = this.props.progress;

    var r = 35;
    var x = r - Math.sin(Math.PI * 2 * progress) * r;
    var y = r - Math.cos(Math.PI * 2 * progress) * r;
    var largeArc = Number(progress >= .5);
    var pathD = 'M' + (r - .01 + 4) + ' ' + (4) + ' A' + r + ' ' + r + ' 0 ' + largeArc + ' 0 ' + (x + 4) + ' ' + (y + 4) + ' '

    return (
      <Animated.View style={[styles.background, { backgroundColor:color, height: this.props.height }]}>
        <Animated.View style={{
          opacity: this.props.opacity,
          transform: [
            { translateY: this.props.position },
            { scale: 0.5 },
          ]
        }}>

          <Svg height='100' width='100' style={{
            position: 'absolute',
            backgroundColor: 'transparent',
            transform: [
              { translateX: -39 },
              { translateY: -39 },
            ]
          }}>
            <Circle cx='39' cy='39' r='35' fill='white' />
            <Path d={pathD} fill='transparent' stroke='#c0c' strokeWidth='6' />
          </Svg>

          <Animated.View style={[styles.notificationIcon, {
            transform: [
              { rotate: this.props.clockwiseRotation },
              { translateX: -20 },
              { translateY: -20 },
            ]
          }]}>
            <Animated.Image
              source={require('../../resources/images/notification_envelope_back.png')}
              style={[
                styles.icon, {
                  transform: [
                    { translateY: this.props.downTranslation },
                  ]
                }]}

            />
            <Animated.Image
              source={require('../../resources/images/notification_letter.png')}
              style={[
                styles.icon, {
                  transform: [
                    { translateY: this.props.upTranslation },
                  ]
                }]}
            />
            <Animated.Image
              source={require('../../resources/images/notification_envelope_front.png')}
              style={[
                styles.icon, {
                  transform: [
                    { translateY: this.props.downTranslation },
                  ]
                }]}
            />
          </Animated.View>

        </Animated.View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  background: {
    // backgroundColor: '#24589A',
    //height: 130,
    alignItems: 'center',
    overflow: 'hidden'
  },

  notificationIcon: {
    margin: 'auto',
  },

  icon: {
    position: 'absolute',
  },
})

module.exports = RefreshIndicator
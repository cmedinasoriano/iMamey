import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Image
} from 'react-native'

const { height, windowWidth } = Dimensions.get('window')

class ImageLoader extends Component {


  constructor(props) {
    super(props);

    this.loaded = false;

    this.state = {
      loaded: false
    };
  }

  render() {
    return (
      <View>
        <Image ref='temp' source={this.props.loadingSource} style={[this.props.style, this.state.loaded ? {display: 'none'} : null]} /> 
        <Image ref='loader' source={ this.props.source } style={[this.props.style, !this.state.loaded ? {position: 'absolute'} : null]} onLoad={ (event) => this.onLoad(event) } />
      </View>
    );
  }

  onLoad(event) {
    this.setState({loaded: true});
  }

}

module.exports = ImageLoader
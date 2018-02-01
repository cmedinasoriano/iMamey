import React, { Component } from 'react'
import {
  View,
  Image
} from 'react-native'

export default class ImageLoader extends Component {

  state = {
    loaded: false
  };

  handleLoad = () => this.setState({loaded: true});

  render() {

    const { style, source, loadingSource } = this.props;
    const { loaded } = this.state;

    return (
      <View>
        <Image ref={'temp'} 
        source={loadingSource} 
        style={[style, loaded ? {display: 'none'} : null]} /> 

        <Image ref={'loader'} 
        source={ source } 
        style={[style, !loaded ? {position: 'absolute'} : null]} 
        onLoad={this.handleLoad} />
      </View>
    );
  }

}
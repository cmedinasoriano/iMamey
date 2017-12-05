class IMameyImageSlide extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    return (
      <View style={styles.thumb}>
        <Image style={styles.img} source={this.props.source} />
      </View>
    );
  }
}
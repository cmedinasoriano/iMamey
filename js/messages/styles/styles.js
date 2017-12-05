import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    // backgroundColor: '#D5DDDF',
  },

  text: {
    fontFamily: 'HelveticaNeue-Light',
  },

  navBar: {
    flexDirection: 'row',
    paddingTop: 20,
    height: 64,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  navBarHeader: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 16,
  },

  navBarButton: {
    color: '#FFFFFF',
    textAlign: 'center',
    width: 64,
  },

  tabBar: {
    height: 50,
  },

  tabBarButton: {
    flex: 1,
  },

  row: {
    padding: 6,
    marginBottom: 6,
    backgroundColor: '#fff',
  },

  h1: {
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
    color: '#000',
    margin: 4,
  },

  h2: {
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
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

  fillParent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    bottom: 0,
  },

  logger: { 
    position: 'absolute',
    bottom: 0,
    maxHeight: 70,
    minHeight: 0,
    width: '100%',
    // justifyContent: 'space-between',
    flex: 0,
    flexDirection: 'column',
  },

  
});
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  text: {
    fontFamily: 'HelveticaNeue-Light',
  },

  dashboard: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBottom: 50,
  },

  row: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',

    width: dashboardItemSize,
    height: dashboardItemSize,
    margin: dashboardItemMargin,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 22,
  },

  icon: {
    width: 80, 
    height: 80,
    alignSelf: 'center',
    marginBottom: 0, 
  },

  statusBar: {
    height: 20,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#CCCCCC99',
    borderBottomWidth: 1,
  },

});

export default styles;

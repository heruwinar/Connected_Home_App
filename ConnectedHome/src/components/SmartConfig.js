import React from 'react';
import {connect} from 'react-redux';
import * as smartConfigStore from '../store/SmartConfigStore';
import Smartconfig from 'react-native-smartconfig';
import {
  ImageBackground,
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {Layout, Button, Input} from 'react-native-ui-kitten';
import CardView from 'react-native-cardview';
import BI from '../assets/img/background.jpg';

class SmartConfigScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ssid: 'EIU FACULTY/STAFF',
      password: 'EIU.edu@!%',
      scanning: false,
      listDevice: [],
      ownUpdate: false,
    };

    this.smartConfigScan = this.smartConfigScan.bind(this);
    this.connectToStoreAndAddDevice = this.connectToStoreAndAddDevice.bind(
      this,
    );
  }

  componentWillReceiveProps(nexProps) {
    if (nexProps.addSwitchIntoAccoutnSuccess === true) {
      this.setState({scanning: false, listDevice: nexProps.addedDevices});
    }
  }

  render() {
    const {ssid, password, scanning, listDevice} = this.state;

    return (
      <ImageBackground style={{width: '100%', height: '100%'}} source={BI}>
        <ScrollView
          behavior="height"
          keyboardVerticalOffset={64}
          style={{marginTop: '5%', flex: 1}}
          enabled>
          <View>
            <ImageBackground style={styles.authContent}>
              <Layout style={styles.tabContent}>
                <CardView
                  cardElevation={5}
                  cardMaxElevation={5}
                  cornerRadius={5}
                  style={styles.cardContent}>
                  <View>
                    <Text style={styles.h4}>DÒ THIẾT BỊ</Text>
                  </View>
                  <Input
                    value={ssid}
                    onChangeText={text => this.setState({ssid: text})}
                    style={styles.input}
                    placeholder="Tên Wifi"
                    onSubmitEditing={() => this.passwordRef.focus()}
                  />
                  <Input
                    value={password}
                    onChangeText={text => this.setState({password: text})}
                    style={styles.input}
                    placeholder="Mật khẩu"
                    ref={ref => (this.passwordRef = ref)}
                    secureTextEntry
                    onSubmitEditing={this.login}
                  />

                  {scanning === false ? (
                    <Button size="large" onPress={() => this.smartConfigScan()}>
                      DÒ THIẾT BỊ
                    </Button>
                  ) : (
                    <View style={styles.loading}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  )}
                </CardView>
              </Layout>

              {listDevice && listDevice.length > 0 && (
                <Layout style={styles.tabContent}>
                  <CardView
                    cardElevation={5}
                    cardMaxElevation={5}
                    cornerRadius={5}
                    style={styles.cardContent}>
                    <View>
                      <Text style={styles.h4}>
                        ĐÃ THÊM THIẾT BỊ VÀO DANH SÁCH THIẾT BỊ CỦA TÀI KHOẢN
                      </Text>
                    </View>
                    <View>
                      {listDevice.map((device, index) => (
                        <Text style={styles.device} key={index}>
                          - {device.code} - {device.name}
                        </Text>
                      ))}
                    </View>
                    <Button
                      size="large"
                      onPress={() =>
                        this.setState({listDevice: null, ownUpdate: true})
                      }>
                      OK
                    </Button>
                  </CardView>
                </Layout>
              )}
            </ImageBackground>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  async connectToStoreAndAddDevice(results) {
    this.props.registerDevice(results);
  }

  async smartConfigScan() {
    const {ssid, password} = this.state;
    this.setState({scanning: true});
    //#region check valid ssid and password
    if (ssid === '') {
      Toast.show('Vui lòng nhập tên wifi');
      this.setState({scanning: false});
      return;
    }

    if (password === '') {
      Toast.show('Vui lòng nhập mật khẩu');
      this.setState({scanning: false});
      return;
    }

    //#endregion

    //#region Bắt đầu dò những thiết bị xung quanh
    await Smartconfig.start({
      type: 'esptouch', //or airkiss, now doesn't not effect
      ssid: ssid,
      bssid: '', //"" if not need to filter (don't use null)
      password: password,
      timeout: 20000, //now doesn't not effect
    })
      .then(results => {
        //Array of device success do smartconfig
        this.connectToStoreAndAddDevice(results);
      })
      .catch(error => {
        Toast.show('Có lỗi xảy ra trong quá trình dò. Vui lòng thử lại');
        this.setState({scanning: false});
      });
    //#endregion
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  h4: {
    textAlign: 'center',
    color: 'blue',
    marginBottom: 10,
    fontSize: 20,
  },
  device: {
    textAlign: 'left',
    fontSize: 15,
  },
  authContent: {
    padding: 20,
  },
  card: {
    marginTop: 20,
    padding: 20,
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'red',
    elevation: 3,
  },
  tabContent: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'transparent',
  },
  cardContent: {
    padding: 20,
  },
  input: {
    marginBottom: 20,
  },
  tab: {
    backgroundColor: 'transparent',
    color: '#fff',
  },
  title: {
    color: '#fff',
  },
});

export default connect(
  smartConfigStore.mapStateToProps,
  smartConfigStore.mapDispatchToProps,
)(SmartConfigScreen);

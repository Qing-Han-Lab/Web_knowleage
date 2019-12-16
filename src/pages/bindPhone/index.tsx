import Taro, { Component, Config } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../api/api'
import tips from '../../utils/tips'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '绑定手机号'
  }
  constructor() {
    super(...arguments)
    this.state = {
      phoneNumber: '',
      checkCode: '',
      msg: '获取验证码',
      isGet: false
    }
  }
  componentDidMount() { }
  componentDidShow() { }
  modelPhoneNum(e) {
    // 设置手机号
    let value = e.target.value;
    this.setState({
      phoneNumber: value
    })
  }
  modelCheckCode(e) {
    // 设置验证码
    let value = e.target.value;
    this.setState({
      checkCode: value
    })
  }
  goHome() {
    // 去主页
    Taro.switchTab({
      url: '../home/index'
    })
  }
  toGetCode() {
    // 获取验证码
    const { isGet, phoneNumber } = this.state as any
    if (isGet === true) {
      tips.showToast('60秒内只能请求一次验证码')
      return
    } else {
      if (!/1[^0,^1,^2]\d{9}$/.test(phoneNumber)) {
        tips.showToast('手机号输入错误')
        return
      }
      Taro.request({
        url: api.sendIdentifyCode,
        data: {
          smsInfo: JSON.stringify({
            mobile: phoneNumber,
            clientId: 'dg_app',
            module: 'login'
          })
        },
        header: {
          'content-type': 'application/json'
        },
      }).then((res) => {
        if (res.data.success === true) {
          tips.showToast('验证码已发送到您的手机,请注意查收！')
          let sec = 60;
          this.setState({
            isGet: true,
            msg: '60s内有效'
          })
          let timer = setInterval(() => {
            if (sec === 0) {
              clearInterval(timer);
              this.setState({
                msg: '获取验证码',
                isGet: false
              })
            } else {
              this.setState({
                msg: (--sec) + 's内有效'
              })
            }
          }, 1000)
        } else {
          tips.showToast(res.data.msgInfo)
        }
      })
    }
  }
  login() {
    // 获取accesssToken和userToken
    const { globalStore: { userInfo } } = this.props as any
    const { globalStore } = this.props as any
    const { phoneNumber, checkCode } = this.state as any;
    if (!/1[^0,^1,^2]\d{9}$/.test(phoneNumber)) {
      tips.showToast('手机号输入错误')
      return
    }
    if (checkCode.trim() === '') {
      tips.showToast('验证码不能为空')
      return
    }
    let str = JSON.stringify(userInfo)
    let uuId = wx.getStorageSync('uuid');
    Taro.login().then(res1 => {
      Taro.request({
        url: api.register,
        data: {
          userJson: JSON.stringify({
            clientId: 'dg_app',
            mobile: phoneNumber,
            identifyCode: checkCode,
            module: 'bind',
            weixinCode: res1.code
          }),
          userExtInfo: encodeURIComponent(str)
        },
        header:{
          'Device-Id' : uuId
        }
      }).then((res) => {
        if (res.data.success === true) {
          Taro.login().then(response => {
            Taro.request({
              url: api.weixinUserLogin,
              data: {
                clientCode: '889033',
                code: response.code,
                userInfo: str
              },
              header:{
                'Device-Id' : uuId
              }
            }).then(res2 => {
              if (res2.data.success === true) {
                let aToken = res2.data.model.accessToken, uToken = res2.data.model.userToken;
                globalStore.saveUserToken(aToken, uToken);
                wx.setStorageSync('accessToken', aToken);
                wx.setStorageSync('userToken', uToken);
                tips.showToast('登陆中,请稍后', 'loading', 1000).then(() => {
                  this.goHome();
                })
              } else {
                tips.showToast(res2.data.msgInfo)
              }
            })
          })
        } else {
          wx.showToast({
            title: res.data.msgInfo,
            icon: 'none'
          })
        }
      })
    })
  }
  setUserInfo(aToken, uToken) {
    const { globalStore } = this.props as any;
    let getUserInfo = api.getUserInfo;
    let uuId = wx.getStorageSync('uuid');
    Taro.request({
      url: getUserInfo,
      header: {
        'content-type': 'application/json',
        'User-Token': uToken,
        'Access-Token': aToken,
        'Device-Id' : uuId
      },
    }).then((res) => {
      if (res.data.success === true) {
        let info = res.data.model
        globalStore.saveUserInfo(info);
      }
    })
  }
  render() {
    const { phoneNumber, checkCode, msg, isGet } = this.state as any
    return (
      <View className="mobile">
        <View className="mobile-title">绑定手机号</View>
        <View className="mobile-subtitle">欢迎来到好价鼻子</View>
        <View className="phoneInput">
          <Input type="number" maxLength={11} placeholder="请输入手机号" onInput={this.modelPhoneNum.bind(this)} value={phoneNumber}></Input>
        </View>
        <View className="codeInput">
          <Input type="number" maxLength={6} placeholder="请输入验证码" onInput={(e) => { this.modelCheckCode(e) }} value={checkCode}></Input>
          <View className={isGet === true ? 'codeInput-code isGet' : 'codeInput-code'} onClick={this.toGetCode.bind(this)}>{msg}</View>
        </View>
        <View className="login-now" onClick={this.login.bind(this)}>立即绑定</View>
      </View>
    )
  }
}
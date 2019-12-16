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
    navigationBarTitleText: '手机号登陆'
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
      wx.showToast({
        title: '60秒内只能请求一次验证码',
        icon: 'none'
      })
      return
    } else {
      if (!/1[^0,^1,^2]\d{9}$/.test(phoneNumber)) {
        wx.showToast({
          title: '手机号输入错误',
          icon: 'none'
        })
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
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.data.success === true) {
          wx.showToast({
            title: '验证码已发送到您的手机,请注意查收！',
            icon: 'none'
          })
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
          wx.showToast({
            title: res.data.msgInfo,
            icon: 'none'
          })
        }
      })
    }
  }
  login() { // 获取accesssToken和userToken
    // const { globalStore: { accessToken, userToken } } = this.props as any
    const { globalStore } = this.props as any
    const { phoneNumber, checkCode } = this.state as any;
    if (!/1[^0,^1,^2]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: '手机号输入错误',
        icon: 'none'
      })
      return
    }
    if (checkCode.trim() === '') {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none'
      })
      return
    }
    Taro.request({
      url: api.mobileLogin,
      data: {
        clientCode: '889033',
        mobile: phoneNumber,
        identifyCode: checkCode,
        module: 'login'
      },
    }).then((res) => {
      if (res.data.success === true) {
        let aToken = res.data.model.accessToken, uToken = res.data.model.userToken;
        globalStore.saveUserToken(aToken, uToken);
        wx.setStorageSync('accessToken', aToken);
        wx.setStorageSync('userToken', uToken);
        tips.showToast('登陆中,请稍后', 'loading', 1000).then(() => {
          this.setUserInfo(aToken, uToken);
          this.goHome();
        })
      } else {
        wx.showToast({
          title: res.data.msgInfo,
          icon: 'none'
        })
      }
    }).catch((errs)=>{
      wx.showToast({
        title: errs.data.msgInfo,
        icon: 'none'
      })
    })
  }
  setUserInfo(aToken, uToken) {
    const { globalStore } = this.props as any;
    let getUserInfo = api.getUserInfo;
    Taro.request({
      url: getUserInfo,
      header: {
        'content-type': 'application/json',
        'User-Token': uToken,
        'Access-Token': aToken,
      },
    }).then((res) => {
      if (res.data.success === true) {
        console.log(res.data.model,'哈哈哈')
        wx.setStorageSync('inviteCode',res.data.model.inviteCode)
        wx.setStorageSync('mobile',res.data.model.mobile);
        let info = res.data.model;
        globalStore.saveUserInfo(info);
      }
    })
  }
  render() {
    const { phoneNumber, checkCode, msg, isGet } = this.state as any
    return (
      <View className="mobile">
        <View className="mobile-title">手机登录</View>
        <View className="mobile-subtitle">欢迎来到好价鼻子</View>
        <View className="phoneInput">
          <Input type="number" maxLength={11} placeholder="请输入手机号" onInput={(e) => { this.modelPhoneNum(e) }} value={phoneNumber}></Input>
        </View>
        <View className="codeInput">
          <Input type="number" maxLength={6} placeholder="请输入验证码" onInput={(e) => { this.modelCheckCode(e) }} value={checkCode}></Input>
          <View className={isGet === true ? 'codeInput-code isGet' : 'codeInput-code'} onClick={() => { this.toGetCode() }}>{msg}</View>
        </View>
        <View className="login-now" onClick={() => { this.login() }}>立即登录</View>
        {/* <View className="phone-protocool">
          登录即代表同意好价鼻子
      <View>用户协议</View>和
      <View>隐私政策</View>
        </View> */}
      </View>
    )
  }
}
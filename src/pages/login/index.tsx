import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../api/api'
import tips from '../../utils/tips'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '好价鼻子'
  }

  constructor() {
    super(...arguments)
    this.state = {
      loginCode: ''
    }
  }

  componentWillMount() {
    const { globalStore } = this.props as any
    Taro.login()
    let code = this.$router.params.invitecode;  // 他人的邀请码
    let mobile = this.$router.params.mobile; // 他人手机号
    let scene = this.$router.params.scene as any; // 二维码扫码的邀请码
    if (scene) {
      code = decodeURIComponent(scene);
    }
    if (code) {
      if (mobile) {
        globalStore.saveOtherInviteCode(code, mobile);
      } else {
        globalStore.saveOtherInviteCode(code);
      }
    }
    let aToken = wx.getStorageSync('accessToken')
    if (aToken) {
      // 有登录态
      Taro.switchTab({
        url: '../home/index'
      })
    }
  }
  componentDidMount() {
  }
  componentDidShow() {
  }
  getPhoneNumber(res) {
    if (res.detail.errMsg === 'getPhoneNumber:ok') {
      Taro.showLoading({
        title: '登录中,请稍候',
        mask: true
      })
      setTimeout(() => {
        Taro.hideLoading()
      }, 5000)
      Taro.login().then(res1 => {
        Taro.request({
          url: api.weixinUserLogin,
          data: {
            clientCode: '889033',
            code: res1.code
          }
        }).then(res2 => {
          if (res2.data.success === true) {
            // 用户已注册
            wx.setStorageSync('accessToken', res2.data.model.accessToken);
            wx.setStorageSync('userToken', res2.data.model.userToken);
            tips.showToast('登陆中,请稍后..', 'loading', 1000).then(() => {
              this.goHome();
            })
            Taro.hideLoading()
          } else {
            // 用户未注册
            Taro.login().then(res3 => {
              Taro.request({
                url: api.register,
                data: {
                  userJson: JSON.stringify({
                    clientId: 'dg_app',
                    module: 'bind',
                    weixinCode: res3.code,
                    encryptedData: encodeURIComponent(res.detail.encryptedData),
                    iv: encodeURIComponent(res.detail.iv)
                  }),
                  userExtInfo: '{}'
                }
              }).then((res4) => {
                if (res4.data.success === true) {
                  Taro.login().then(res5 => {
                    Taro.request({
                      url: api.weixinUserLogin,
                      data: {
                        clientCode: '889033',
                        code: res5.code,
                      }
                    }).then(res6 => {
                      if (res6.data.success === true) {
                        wx.setStorageSync('accessToken', res6.data.model.accessToken);
                        wx.setStorageSync('userToken', res6.data.model.userToken);
                        tips.showToast('登陆中,请稍后', 'loading', 1000).then(() => {
                          this.goHome();
                        })
                        Taro.hideLoading()
                      } else {
                        Taro.hideLoading()
                        tips.showToast(res6.data.msgInfo)
                      }
                    })
                  })
                } else {
                  Taro.hideLoading()
                  tips.showToast(res4.data.msgInfo)
                }
              })
            })
          }
        })
      })
    } else {
      tips.showToast('用户拒绝授权!')
    }
  }

  goHome() {
    // 去主页
    Taro.switchTab({
      url: '../home/index'
    })
  }

  render() {
    return (
      <View className='login'>
        <View className='login-logo'>
          <Image src={require('../../assets/images/login_logo.png')} />
        </View>
        <View className='login-text'>好价鼻子</View>
        <Button className="login-wechat" open-type='getPhoneNumber' onGetPhoneNumber={this.getPhoneNumber.bind(this)}>微信快捷登录</Button>
      </View>
    )
  }

}
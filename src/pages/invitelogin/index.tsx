import Taro, { Component, Config } from '@tarojs/taro'
import { View, Input, Image } from '@tarojs/components'
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
      inviteUser: {
        headUrl: '',
        nickName: '',
        inviteCode: ''
      }
    }
  }
  componentWillMount() {
    const { globalStore } = this.props as any
    const { globalStore: { otherPhone, otherInviteCode, userToken, accessToken, uuid } } = this.props as any;
    if (otherInviteCode !== '') {
      Taro.request({
        url: api.getUser,
        data: {
          inviteCode: otherInviteCode,
          mobile: otherPhone
        },
        header: {
          'content-type': 'application/json',
          'User-Token': userToken,
          'Access-Token': accessToken,
          'Device-Id': uuid
        }
      }).then((res) => {
        if (res.data.success) {
          let obj = {
            headUrl: res.data.model.userHeadUrl,
            nickName: res.data.model.nickName,
            inviteCode: res.data.model.inviteCode
          }
          this.setState({
            inviteUser: obj
          })
        }
      })
      // 清除所有存储的邀请信息，避免回退时重复触发跳转该页面
      globalStore.saveOtherInviteCode('', '')
    }
  }
  componentDidMount() { }
  componentDidShow() { }
  toBind() {
    const { inviteUser } = this.state as any
    const { globalStore: { userToken, accessToken, uuid } } = this.props as any;
    Taro.request({
      url: api.bindInviteCode,
      data: {
        userJson: JSON.stringify({
          inviteCode: inviteUser.inviteCode
        })
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      }
    }).then((res) => {
      if (res.data.success === true) {
        // 绑定成功
        console.log('绑定成功')
        Taro.switchTab({
          url: '../home/index'
        })
      } else {
        tips.showToast(res.data.msgInfo)
      }
    })
  }
  render() {
    const { inviteUser } = this.state as any
    return (
      <View className='invitelogin'>
        <View className='invitelogin-input'>邀请人信息: </View>
        <View className='invitelogin-info'>
          <View className='invitelogin-info-left'>
            <Image src={inviteUser.headUrl ? inviteUser.headUrl : '../../assets/ychImages/userhead.png'} />
          </View>
          <View className='invitelogin-info-right'>
            <View className='invitelogin-info-right-name'>{inviteUser.nickName}</View>
            <View className='invitelogin-info-right-text'>邀请您加入好价鼻子</View>
          </View>
        </View>
        <View className='invitelogin-btn' onClick={this.toBind.bind(this)}>下一步</View>
      </View>
    )
  }
}
import Taro, { Component, Config } from '@tarojs/taro'
import { View,Input } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../api/api'
import tips from '../../utils/tips'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '绑定邀请码'
  }
  constructor() {
    super(...arguments)
    this.state = {
      value : ''
    }
  }
  componentDidMount() { }
  componentDidShow() { }
  bindValue(e){
    let values = e.target.value;
    this.setState({
      value : values
    })
  }
  toBindUser(){
    const {value} = this.state as any;
    const {globalStore : {userToken,accessToken, uuid}} = this.props as any;
    console.log(value);
    Taro.request({
      url : api.bindInviteCode,
      data:{
        userJson: JSON.stringify({
          inviteCode: value
        })
      },
      header:{
        'content-type' : 'application/json',
        'User-Token' : userToken,
        'Access-Token' : accessToken,
        'Device-Id' : uuid
      }
    }).then((res)=>{
      if(res.data.success){
        tips.showToast('绑定成功','success',1500).then(()=>{
          // 掉用户信息   拿到新的用户信息存储globalStore 之后关闭页面
         this.getUserInfo();
        })
      }else{
        wx.showToast({
          title : res.data.msgInfo,
          icon : 'none'
        })
      }
    }).catch(()=>{
      tips.showToast('绑定失败');
    })
  }
  getUserInfo(){
    const {globalStore : {accessToken,userToken, uuid}} = this.props as any;
    const {globalStore} = this.props as any;
    Taro.request({
      url : api.getUserInfo,
      header:{
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then((res)=>{
      if(res.data.success){ // 将用户信息保存到globalStore里
        Taro.setStorageSync('userInfo', res.data.model)
        globalStore.saveUserInfo(res.data.model);
        globalStore.saveOtherInviteCode('', '')
        Taro.switchTab({
          url : '../home/index'
        })
      }
    })
  }
  render() {
    const { value } = this.state as any
    return (
      <View className='bindcode-view'>
        <Input placeholder='请输入邀请码' onInput={(e)=>{this.bindValue(e)}} value={value} type='number' maxLength={7}></Input>
        <View className='surebtn' onClick={()=>{this.toBindUser()}}>确定</View>
      </View>
    )
  }
}
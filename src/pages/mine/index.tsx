import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Button, Canvas } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../api/api'
import tips from '../../utils/tips'

@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '',
    navigationBarBackgroundColor: '#FB2C68'
  }

  constructor() {
    super(...arguments)
    this.state = {
      toastitem: 0, // 4代表提现弹窗  1代表微信弹窗  2代表海报弹窗
      shadowflag: false,
      high: '28px',
      wechatNum: 'bizikefu',
      shareQRcode: '',
      selectList: [
        {
          id: 1,
          url: require('../../assets/ychImages/invit.png'),
          name: '专属邀请海报'
        },
        // {
        //   id: 2,
        //   url: require('../../assets/images/icon-issue.png'),
        //   name: '绑定邀请码'
        // },
        {
          id: 3,
          url: require('../../assets/ychImages/question.png'),
          name: '常见问题'
        },
        {
          id: 4,
          url: require('../../assets/ychImages/callpeople.png'),
          name: '联系客服'
        }
      ],
      money: '0.00'
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
  }

  componentDidShow() {
    this.getUserDrawMoney()
    this.getUserInfo()
    this.getQRCode()
  }

  getQRCode() {
    const { globalStore: { userToken, accessToken, uuid } } = this.props as any;
    if (accessToken !== '') {
      Taro.request({
        url: api.genUserQrcode,
        header: {
          'User-Token': userToken,
          'Access-Token': accessToken,
          'Device-Id': uuid
        }
      }).then((res) => {
        this.setState({
          shareQRcode: res.data.model
        }, () => {
          this.sharePicture()
        })
      }).catch(() => {
        tips.showToast('生成邀请二维码失败,将无法保存邀请二维码到相册')
      })
    }
  }

  toast() {
    tips.showToast('正在分享', 'loading', 800)
  }

  onShareAppMessage(res) {
    const { globalStore: { userInfo } } = this.props as any
    if (res.from === 'button') {
      tips.showToast('正在分享', 'loading')
    }
    return {
      title: '好价鼻子',
      path: '/pages/login/index?invitecode=' + userInfo.inviteCode + '&mobile=' + userInfo.mobile,
      imageUrl: require('../../assets/ychImages/mine_invite.png')
    }
  }

  getUserDrawMoney() {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    Taro.request({
      url: api.getUserMoney,
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      }
    }).then((res) => {
      if (res.data.success) {
        let withdrawMoney = res.data.model.withdrawMoney;
        this.setState({
          money: withdrawMoney
        })
      }
    })
  }

  getUserInfo() {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    const { globalStore } = this.props as any
    const { selectList } = this.state as any;
    Taro.request({
      url: api.getUserInfo,
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      },
    }).then((res) => {
      if (res.data.success === true) {
        if (res.data.model.inviteCode !== '' && res.data.model.inviteCode !== null) {
          let list = selectList.filter((item) => {
            return item.id !== 2
          })
          this.setState({
            selectList: list
          })
        } else {
          let obj = {
            id: 2,
            url: require('../../assets/images/icon-issue.png'),
            name: '绑定邀请码'
          }
          let isShift = false
          selectList.map((item) => {
            if (item.id === 2) {
              isShift = true
            }
          })
          if (!isShift) {
            selectList.splice(1, 0, obj)
            this.setState({
              selectList: selectList
            })
          }
        }
        Taro.setStorage({
          key: 'userInfo',
          data: res.data.model
        })
        globalStore.saveUserInfo(res.data.model)
      }
    })
  }

  closeShadow() {
    this.setState({
      shadowflag: false
    })
  }

  toToast(num) {
    if ([1, 4, 5].indexOf(num) !== -1) {
      this.setState({
        shadowflag: true,
        toastitem: num
      })
    }
  }

  sharePicture() {  // 绘制海报
    const { shareQRcode } = this.state as any;
    let rpx;
    Taro.getSystemInfo().then(res => {
      rpx = res.windowWidth / 375;
      Taro.getImageInfo({
        src: shareQRcode
      }).then(res => {
        let path = res.path
        let ctx = wx.createCanvasContext('cvs');
        ctx.drawImage('../../assets/ychImages/advback.png', 0, 0, 526 * rpx, 936 * rpx);
        ctx.drawImage(path, 342 * rpx, 728 * rpx, 150 * rpx, 150 * rpx)
        ctx.setFontSize(12 * rpx);
        ctx.setFillStyle('#FFF')
        ctx.fillText('「识别小程序二维码」', 356 * rpx, 910 * rpx)
        ctx.stroke()
        ctx.draw()
      })
    })
  }

  toShareInvite() {
    let rpx;
    Taro.getSystemInfo().then(res => {
      rpx = res.windowWidth / 375;
      wx.canvasToTempFilePath({
        canvasId: 'cvs',
        x: 0,
        y: 0,
        width: 526 * rpx,
        height: 936 * rpx,
        destWidth: 526 * rpx,
        destHeight: 936 * rpx,
        success: (res) => {
          let path = res.tempFilePath;
          console.info(path)
          if (path) {
            wx.saveImageToPhotosAlbum({
              filePath: path,
              success: () => {
                wx.showToast({
                  title: '已保存到相册'
                })
              }
            })
          }
        }
      })
    })
  }
  toIssue(index) {
    if (index === 3) {
      Taro.navigateTo({
        url: '../issue/index'
      })
    } else if (index === 2) {
      Taro.navigateTo({
        url: '../bindinvitecode/index'
      })
    }
  }

  copyWechat() {
    const { wechatNum } = this.state as any;
    wx.setClipboardData({
      data: wechatNum,
      success: () => {
        tips.showToast('复制成功', 'success')
      },
      fail: () => {
        tips.showToast('复制失败', 'none')
      }
    })
  }

  getUser() {
    Taro.navigateTo({
      url: '../login/index'
    })
  }

  render() {
    const { wechatNum, selectList, shadowflag, toastitem, money, shareQRcode } = this.state as any
    const { globalStore: { accessToken, userInfo } } = this.props as any;
    return (
      (accessToken !== '') ?
        <View className='mine-container'>
          <Canvas className='cvsbox' canvasId='cvs'></Canvas>
          <View className={`boxshadow${shadowflag ? '' : ' hide'}`}>
            <View className={toastitem !== 1 ? 'close' : 'close maketop'} onClick={() => {
              this.closeShadow()
            }}></View>
            {
              toastitem === 5 ?
                <View className='getmoneywarn'>
                  <Image src={require("../../assets/ychImages/getmoney_warn.png")}></Image>
                </View> :
                null
            }
            {
              toastitem === 4 ?
                <View className="wechatbox">
                  <Image src={require("../../assets/ychImages/wechatback.png")}></Image>
                  <View className="wechattext">您的客服微信号</View>
                  <View className="wechatcode">{wechatNum}</View>
                  <View className="gowechatbtn" onClick={() => {
                    this.copyWechat()
                  }}>复制微信号</View>
                </View> :
                null
            }
            <View className={`advbox${toastitem === 1 ? '' : ' hide'}`}>
              <View className='advback'>
                <View className='qr_codebox'>
                  <Image src={shareQRcode}></Image>
                  <View className='qrcodetext'>「识别小程序二维码」</View>
                </View>
                <Image src={require("../../assets/ychImages/advback.png")}></Image>
              </View>
              <View className='btnbox'>
                <View className='invitbtn' onClick={this.closeShadow.bind(this)}>邀请好友
                          <Button open-type='share'></Button>
                </View>
                <View className='savebtn pink' onClick={this.toShareInvite.bind(this)}>分享海报</View>
              </View>
            </View>
          </View>
          <View className='containertop'>个人中心</View>
          <View className='containeruser'>
            <View className='userbox'>
              <View className='userpic'>
                <Image src={userInfo.userHeadUrl || require("../../assets/ychImages/userhead.png")}></Image>
                <View className='username'>{userInfo.nickName}</View>
              </View>
              {
                userInfo.inviteCode ?
                  <View className='takefriend'>
                    <Button open-type='share' onClick={this.toast.bind(this)}></Button>
                  </View>
                  :
                  <View className='takefriend'>
                    <Button onClick={this.toIssue.bind(this, 2)}></Button>
                  </View>
              }
            </View>
          </View>
          <View className='moneycontainer'>
            <View className='moneytextbox'>
              <View className='moneytextlogo'></View>
              我的余额
            </View>
            <View className='moneynumbox'>
              <View className='havemoney'>
                <View className='money_icon'>￥</View>
                {money}
              </View>
              <View className='getmoney' onClick={() => {
                this.toToast(5)
              }}>提现</View>
            </View>
          </View>
          <View className='selectbox'>
            {
              selectList.map((item, index) => {
                return (
                  <View onClick={() => {
                    this.toToast(item.id)
                  }} key={`A${index}`} className='selectitem'>
                    <View className="AAA" onClick={this.toIssue.bind(this, item.id)}>
                      <View className='itemtext'>
                        <Image className='logo' src={item.url}></Image>
                        {item.name}
                      </View>
                      <View className='todetail'></View>
                    </View>
                  </View>
                )
              })
            }
          </View>
        </View> :
        <View className='noToken-container'>
          <View className='noToken-back'>
            <Image src={require("../../assets/ychImages/searchNone.png")}></Image>
          </View>
          <View className='noToken-text'>您还没有登陆，请登陆后查看我的信息</View>
          <Button className='noToken-login' onClick={this.getUser.bind(this)}>去登陆</Button>
        </View>
    )
  }
}

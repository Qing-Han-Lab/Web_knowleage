import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, ScrollView } from '@tarojs/components'
import api from '../../api/api'
import tips from '../../utils/tips'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import common from '../../utils/common'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '好价鼻子'
  }
  constructor() {
    super(...arguments)
    this.state = {
      list: [],
      addLoading: false,
      page: 2,
      pageSize: 15,
      allLoaded: false,
      landing: false,
      loadLogo: true,
      addText: '正在加载...'
    }
  }
  componentWillMount() { }
  componentDidMount() { 
    // 添加新版本检测逻辑
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  }
  componentDidShow() {
    // 第一次进入页面，把登录态uuid数据写入globalStore
    const { globalStore } = this.props as any
    const { globalStore: { otherInviteCode } } = this.props as any
    let accessToken = Taro.getStorageSync('accessToken')
    let userToken = Taro.getStorageSync('userToken')
    let userInfo = Taro.getStorageSync('userInfo')
    let uuid = Taro.getStorageSync('uuid')
    if (accessToken && userToken) {
      globalStore.saveUserToken(accessToken, userToken)
    }
    if (uuid) {
      globalStore.saveUUID(uuid)
    } else {
      const uuid2 = tips.uuid()
      globalStore.saveUUID(uuid2)
      Taro.setStorageSync('uuid', uuid2)
    }
    if (otherInviteCode) {
      if (userInfo) {
        if (userInfo.inviteCode !== '' && userInfo.inviteCode != null) {
          this.getData()
        } else {
          Taro.request({
            url: api.bindInviteCode,
            data: {
              userJson: JSON.stringify({
                inviteCode: otherInviteCode
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
              globalStore.saveOtherInviteCode('', '')
              this.getData()
            } else {
              Taro.navigateTo({
                url: '../invitelogin/index'
              })
            }
          })
        }
      } else {
        // 没有用户信息，拉取一个判断，邀请的进来，用户肯定有登录态
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
            Taro.setStorageSync('userInfo', res.data.model)
            globalStore.saveUserInfo(res.data.model)
            if (res.data.model.inviteCode !== '' && res.data.model.inviteCode != null) {
              this.getData()
            } else {
              Taro.request({
                url: api.bindInviteCode,
                data: {
                  userJson: JSON.stringify({
                    inviteCode: otherInviteCode
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
                  globalStore.saveOtherInviteCode('', '')
                  this.getData()
                } else {
                  Taro.navigateTo({
                    url: '../invitelogin/index'
                  })
                }
              })
            }
          }
        })
      }
    } else {
      this.getData()
    }
  }

  getData() {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    // 获取首页列表
    Taro.request({
      url: api.queryList,
      data: {
        page: 1,
        pageSize: 15
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      }
    }).then((res) => {
      if (res.data.success === true) {
        if (res.data.model.list != null) {
          if (res.data.model.list.length > 0) {
            this.setState({
              list: res.data.model.list,
              loadLogo: false
            })
          }
        }
      }
    })
  }

  toSearch() {
    // Taro.navigateTo({
    //   url: '../login/index?invitecode=7295947&mobile=18584411785'
    // })
    Taro.navigateTo({
      url: '../search/index?text=0'
    })
  }

  toDetail(item) {
    Taro.navigateTo({
      url: '../product/product2?contentId=' + item.contentId + '&feedsLinkSource=' + item.feedsLinkSource
    })
  }

  getInfoList() {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    const { page, pageSize, list } = this.state as any
    if ((this.state as any).landing === true) {
      return
    } else {
      this.setState({
        landing: true
      })
    }
    this.setState({
      addLoading: true,
      allLoaded: false
    })
    Taro.request({
      url: api.queryList,
      data: {
        page: page,
        pageSize: pageSize,
        platform: 'jingdong'
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        if (res.data.model.list != null) {
          if (res.data.model.list.length > 0) {
            let lists = list.concat(res.data.model.list)
            this.setState({
              list: lists,
              page: page + 1,
              landing: false,
              addLoading: false
            })
          } else {
            this.setState({
              allLoaded: true,
              landing: false,
              addLoading: false
            })
          }
        } else {
          this.setState({
            allLoaded: true,
            landing: false,
            addLoading: false
          })
        }
      } else {
        this.setState({
          landing: false
        })
      }
    }).catch((e) => {
      console.info(e)
      this.setState({
        landing: false
      })
    })
  }
  render() {
    const { list, addLoading, loadLogo, allLoaded } = this.state as any

    const productItems1 = list.map((it, index) => {
      if (it.isWider === 0) {
        return (
          <View className='box' key={`A${index}`} onClick={this.toDetail.bind(this, it)}>
            <View className='box-left'>
              <Image src={it.itemPicUrl} />
            </View>
            <View className='box-right'>
              <View className='box-right-top'>{it.itemName}</View>
              <View className='box-right-centre'>
                <View className='box-right-centre-left'>
                  <View className='box-right-centre-left-icon'>￥</View>
                  <View className='box-right-centre-left-number'>{it.finalPrice}</View>
                </View>
                {
                  (it.commissionAmount && it.commissionAmount !== '0.00') ?
                    <View className='box-right-centre-right'>
                      <View className='box-right-centre-right-ic'>￥</View>
                      <View className='box-right-centre-right-money'>{it.commissionAmount}</View>
                    </View>
                    : null
                }
              </View>
              <View className='box-right-bottom'>
                <View className={common.getPlatformLogo(it.platform)} > {common.getPlatformName(it.platform)} | {tips.formatTime(it.publicTime, 'MM-DD HH:mm')}</View>
                <View className='box-right-bottom-right'>
                  <View className={it.favoriteFlg === true ? 'box-right-bottom-right-loveactive' : 'box-right-bottom-right-love'}>{it.favoriteTimes}</View>
                  <View className='box-right-bottom-right-info'>{it.commentTimes}</View>
                </View>
              </View>
            </View>
          </View>
        )
      } else if (it.isWider === 1) {
        return (
          <View className='recordbox' key={`B${index}`} onClick={this.toDetail.bind(this, it)}>
            <View className='recordbox-header'>
              <View className='recordbox-header-img'>
                <Image src={it.creatorHeadUrl} />
              </View>
              <View className='recordbox-header-title'>{it.creator}</View>
            </View>
            <View className='recordbox-img'>
              <Image src={it.itemPicUrl} />
            </View>
            <View className='recordbox-title'>{it.discountActName}</View>
            <View className='recordbox-bottom'>
              <View className='recordbox-bottom-title'>{it.concessionalDegree}</View>
              <View className='recordbox-bottom-right'>
                <View className='recordbox-bottom-right-love'>
                  <Image src={require('../../assets/images/home_love.png')} />
                  {it.favoriteTimes}
                </View>
                <View className='recordbox-bottom-right-info'>
                  <Image src={require('../../assets/images/home_info.png')} />
                  {it.commentTimes}
                </View>
              </View>
            </View>
          </View>
        )
      } else {
        return
      }
    })

    return (
      <View className='home'>
        <View className='search'>
          <View className='home-search' onClick={this.toSearch.bind(this)}>搜索你想要的商品好价</View>
        </View>
        <ScrollView
          className='center'
          scrollY
          lowerThreshold={100}
          scrollWithAnimation
          onScrollToLower={this.getInfoList.bind(this)}
        >
          {
            loadLogo ?
              <Image className='loadbox' src={require("../../assets/ychImages/loading.gif")}></Image> :
              null
          }
          {
            productItems1
          }
          {
            addLoading ? <View className='home-loading'>正在加载...</View> : null
          }
          {
            allLoaded ? <View className='home-loading'>已经到底了~~~</View> : null
          }
        </ScrollView>
      </View>
    )
  }

}

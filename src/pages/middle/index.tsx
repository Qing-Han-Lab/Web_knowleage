import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, ScrollView, Button } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../api/api'
import tips from '../../utils/tips'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '商品详情'
  }
  constructor() {
    super(...arguments)
    this.state = {
      nowpage: 1,
      title: '好价鼻子优选商品',
      ticket: {},
      detail: {},
      chainUrl: '',
      sign: {},
      itemId: '',
      platform: ''
    }
  }
  componentWillMount() { 
    Taro.hideShareMenu()
  }
  componentDidMount() {
    let data = this.$router.params
    this.setState({
      itemId: data.itemId,
      platform: data.platform,
      sign: data.sign,
      chainUrl: data.share
    },()=>{
      this.getDetail()
    })
  }
  componentDidShow() { }

  getDetail() {
    const {itemId, platform, sign} = this.state as any
    Taro.request({
      url: api.getShareGoodsInfo,
      data: {
        itemId,
        platform,
        sign
      }
    }).then(res=> {
      if (res.data.success === true) {
        let data
        try {
          data = JSON.parse(res.data.model)
        } catch(e) {
          console.info('转JSON失败')
          data = res.data.model
        }
        this.setState({
          ticket: data.ticket,
          detail: data.detail
        })
      }
    })
  }

  onShareAppMessage() {
    const { chainUrl, ticket, sign } = this.state as any
    let title
    if (ticket.platform === 'pingduoduo') {
      title = '拼多多'
    } else {
      title = '京东'
    }
    wx.showToast({
      title : '正在分享',
      icon : 'loading'
    })
    return {
      title: `【${title}】券后￥${ticket.finalPrice}${ticket.originPrice?`原价￥${ticket.originPrice}`:''}${ticket.couponAmount?` 限量❗️${ticket.couponAmount}元优惠券`:''}`,
      path: `/pages/middle/index?share=${encodeURIComponent(chainUrl)}&sign=${sign}&itemId=${ticket.itemId}&platform=${ticket.platform}`,
    }
  }

  changepic(e) {
    let nowpage = e.detail.current + 1;
    this.setState({
      nowpage: nowpage
    })
  }

  goHome() {
    Taro.switchTab({
      url: '../home/index'
    })
  }

  toBuy() {
    const {platform,chainUrl} = this.state as any
    if (platform === 'pingduoduo') {
      Taro.navigateToMiniProgram({
        appId: 'wx32540bd863b27570',
        path: decodeURIComponent(chainUrl) ,
        envVersion: 'release'
      })
    } else {
      Taro.navigateToMiniProgram({
        appId: 'wx1edf489cb248852c',
        path: 'pages/proxy/union/union?isUnion=1&spreadUrl=' + decodeURIComponent(chainUrl),
        envVersion: 'release'
      })
    }
  }

  render() {
    const { nowpage, detail, ticket } = this.state as any
    return (
      <View className='product1-container'>
        <ScrollView className='product1-container-itembox' scrollY>
          <View className='itemshowbox'>
            <View className='pageselectbox'><View className='nowpage'>{nowpage}</View>/{detail.images.length || 0}</View>
            <Swiper className='swiper' onChange={(e) => { this.changepic(e) }}>
              {
                detail.images.map((item, index) => {
                  return (
                    <SwiperItem className='swiperItem' key={index}>
                      <Image className='img' src={item}></Image>
                    </SwiperItem>
                  )
                })
              }
            </Swiper>
          </View>
          <View className='itemtitle'>
            <View className='paltform'></View>
            {detail.itemName}
          </View>
          <View className='sellbox'>
            <View className='nowmoney'><View className='moneylogo'>￥</View>{ticket.finalPrice}</View>
            {
              ticket.originPrice ?
                <View className='oldmoney'>￥{ticket.originPrice}</View>
                : null
            }
            <View className='havesell'>已抢: {ticket.saledNumber}</View>
          </View>
          {
            ticket.couponInfo ?
              <View className='couponbox'>
                <View className="coupon-detail">
                  <View className="coupon-detail-value">
                    <View className='span'>¥</View>
                    <View className="value-num">{ticket.couponAmount}</View>
                    优惠券
              </View>
                  <View className="coupon-detail-vaild">使用期限：{tips.formatTime(ticket.couponInfo.useStartTime)}-{tips.formatTime(ticket.couponInfo.useEndTime)}</View>
                </View>
                <View className="grab-btn">
                  <View>点击</View>
                  <View>领取</View>
                </View>
              </View>
              : null
          }
          <View className="product-detail-title">
            <View className="product-detail-title-text">商品详情</View>
          </View>
          <View className='showpic'>
            {
              detail.images.map((item, index) => {
                return (
                  <Image key={index} src={item}></Image>
                )
              })
            }
          </View>
        </ScrollView>
        <View className='product1-container-buybox'>
          <View className='home' onClick={() => { this.goHome() }}>
            <View className='homelogo'></View>
            <View className='hometext'>首页</View>
          </View>
          <View className='btncontent'>
            <View className='share'>
              <Button open-type='share'>分享</Button>
              <View className='sharelogo'></View>
              <View className='sharetext'>分享</View>
            </View>
            <View className='buy' onClick={this.toBuy.bind(this)}>
              <View className='buylogo'></View>
              <View className='buytext'>购买</View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
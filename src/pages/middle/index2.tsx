import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Button, ScrollView } from '@tarojs/components'
import api from '../../api/api'
import tips from '../../utils/tips'
import './index2.scss'
import { observer, inject } from '@tarojs/mobx'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '好价详情'
  }
  constructor() {
    super(...arguments)
    this.state = {
      detail: {
        images: []
      },
      chainUrl: {}, // 转链
      sign: '', // 中间页获取key
      itemId: '',
      platform: '',
      hotGoodPricelist: [],
      sharePic: '',
      title: '',
      numtype: 0
    }
  }
  componentWillMount() {
    let params = this.$router.params
    this.setState({
      sign: params.sign,
      itemId: params.itemId,
      platform: params.platform,
      chainUrl: params.share
    },()=>{
      this.getDetail()
    })
  }
  componentDidMount() { }
  componentDidShow() { }

  getDetail() {
    const {itemId, platform, sign} = this.state as any
    Taro.request({
      url: api.getShareGoodsInfo,
      data: {
        itemId,
        platform,
        sign
      },
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
          detail: data.detail
        })
      }
    })
  }

  changePage(e) {
    let nownum = e.detail.current;
    this.setState({
      nowpage: nownum
    })
  }

  like() {
    // 点击喜欢
    const { detail } = this.state as any
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    if (accessToken === '' || userToken === '') {
      tips.showToast('请登录后再收藏！！！')
      return ''
    }
    Taro.request({
      url: api.favorite,
      data: {
        contentId: this.$router.params.contentId,
        feedsLinkSource: this.$router.params.feedsLinkSource
      },
      header: {
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success) {
        detail.favoriteFlg ? (detail.favoriteTimes -= 1) : (detail.favoriteTimes += 1)
        detail.favoriteFlg = !detail.favoriteFlg
        this.setState({
          detail
        })
      }
    })
  }

  
  toDetails(index) {
    const { hotGoodPricelist } = this.state as any
    const contentId = hotGoodPricelist[index].contentId
    const feedsLinkSource = hotGoodPricelist[index].feedsLinkSource
    Taro.navigateTo({
      url: '../product/product2?contentId=' + contentId + '&feedsLinkSource=' + feedsLinkSource
    })
  }
  
  onShareAppMessage() {
    const { chainUrl, detail, sign } = this.state as any
    let title
    if (detail.platform === 'pingduoduo') {
      title = '拼多多'
    } else {
      title = '京东'
    }
    wx.showToast({
      title : '正在分享',
      icon : 'loading'
    })
    return {
      title: `【${title}】券后￥${detail.finalPrice}${detail.originPrice ? `原价￥${detail.originPrice}` : ''}${detail.couponAmount ? ` 限量❗️${detail.couponAmount}元优惠券` : ''}`,
      path: `/pages/middle/index2?share=${encodeURIComponent(chainUrl)}&sign=${sign}&itemId=${detail.itemId}&platform=${detail.platform}`,
    }
  }

  buyProduct() {
    // 购买
    const { detail, chainUrl } = this.state as any
    if (detail.platform === 'pingduoduo') {
      Taro.navigateToMiniProgram({
        appId: 'wx32540bd863b27570',
        path: chainUrl,
        envVersion: 'release'
      })
    } else {
      Taro.navigateToMiniProgram({
        appId: 'wx1edf489cb248852c',
        path: 'pages/proxy/union/union?isUnion=1&spreadUrl=' + chainUrl,
        envVersion: 'release'
      })
    }
  }

  render() {
    const { detail, list } = this.state as any

    const imageItems = detail.images.map((item, index) => {
      return (
        <SwiperItem className='swiperitem' key={`A${index}`}>
          <Image src={item}></Image>
        </SwiperItem>
      )
    })

    const commoditydetails = (
      <View className='whitebox'>
        {/* <Canvas canvasId='cvs' className='cvs'></Canvas> */}
        <View className='itemshow'>
          <Swiper
            className='swiper'
            onChange={this.changePage.bind(this)}
            indicatorDots
            indicatorColor='#333'
            indicatorActiveColor='#ccc'
          >
            {imageItems}
          </Swiper>
        </View>
        <View className="product2-content-title">
          <View className="product2-content-title-text">{detail.itemName}</View>
        </View>
        <View className="product2-content-price">
          <View className='moneylogo'>￥</View>
          <View className='moneynum'>{detail.finalPrice}</View>
          元 {(detail.couponInfo && detail.couponInfo.discount && detail.couponInfo.discount !== '0.00') ? '(需用券)' : ''}
        </View>
        <View className={`product2-content-time ${detail.platform === 'jingdong' ? 'jd' : 'pdd'}`}>{detail.platform === "jingdong" ? '京东' : '拼多多'} | {tips.formatTime(detail.publicTime, 'MM-DD HH:mm')}</View>

        {list.couponAmount ?
          <View className="product2-content-cert">
            <View className="product2-content-cert-subtitle">领券</View>
            <View className='product2-content-cert-item'>满{detail.couponInfo.quota}减{detail.couponInfo.discount}</View>
          </View> :
          ''
        }

        <View className="product2-content-context">
          <View className="product2-content-context-p">{detail.recomendReason ? detail.recomendReason : ''}</View>
          <View className="product2-content-context-p">{detail.goodsDetail ? detail.goodsDetail : ''}</View>
          <View className="product2-content-context-tip">商品价格有较强的时效性，有需要的话尽快下手哦！</View>
        </View>
      </View>
    )
    /*
    const hot = hotGoodPricelist.map((it, index) => {
      return (
        <View key={`D${index}`} className='recommenditem' onClick={this.toDetails.bind(this, index)}>
          <View className='pic'>
            <Image src={it.images}></Image>
          </View>
          <View className='sellcontent'>
            <View className='selltitle'>{it.itemName}</View>
            <View className='moneycontent'>
              <View className='money'>
                <View className='smallmoneylogo'>￥</View>{it.finalPrice}
              </View>
              {
                it.commissionAmount && it.commissionAmount !== '0.00' ?
                  <View className='returnmoney'>
                    <View className='returnlogo'></View>
                    <View className='smallmoneylogo2'>￥</View>
                    <View className='returnmoneynum'>{it.commissionAmount}</View>
                  </View> : null
              }
            </View>
            <View className='morecontent'>
              <View className='morecontent-left'>{it.platform === 'jingdong' ? '京东' : '拼多多'} | {tips.formatTime(it.publicTime, 'MM-DD HH:mm')}</View>
              <View className='morecontent-right'>
                <View className='morecontent-right-like'>{it.favoriteTimes}</View>
                <View className='morecontent-right-massage'>{it.commentTimes}</View>
              </View>
            </View>
          </View>
        </View>
      )
    })*/

    const buynav = (
      <View className='buybox'>
        <View className="product2-bottom-like" onClick={this.like.bind(this)}>
          <View className={detail.favoriteFlg ? 'product2-bottom-like-imgactive' : 'product2-bottom-like-img'}></View>
          <View className="product2-bottom-like-text">{detail.favoriteTimes}</View>
        </View>
        <View className="product2-bottom-share">
          <Button open-type='share'></Button>
          <View className="product2-bottom-share-img"></View>
          <View className="product2-bottom-share-text">分享</View>
        </View>
        <View className="product2-bottom-reply">
          <View className="product2-bottom-reply-img"></View>
          <View className="product2-bottom-reply-text">{detail.commentTimes}</View>
        </View>
        <View className="product2-bottom-buy" onClick={this.buyProduct.bind(this)}>立即购买</View>
      </View>
    )

    
    return (
      <View className='product2-container'>
        <ScrollView className='product2-container-goodscontent' scrollY>
          {
            commoditydetails
          }
        </ScrollView>
        <View className='product2-container-buycontent'>
          {
            buynav
          }
        </View>
      </View>
    )
  }
}

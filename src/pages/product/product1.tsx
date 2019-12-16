import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Button, ScrollView } from '@tarojs/components'
import './index1.scss'
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
      goodsList: [],
      ticket: {},
      detail: {
        images: []
      },
      chainUrl: {},
      sign: {}
    }
  }
  componentWillMount() {
    // this.saveCanvasPic()
    this.getGoodsSend()
  }
  componentDidMount() {
    Taro.getStorage({
      key: 'detail'
    }).then((res) => {
      this.setState({
        ticket: res.data
      }, () => {
        this.getDetail()
        this.chainUrl()
      })
    })
  }
  componentDidShow() { }

  getDetail() {
    // 获取详情
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    const { ticket } = this.state as any
    Taro.request({
      url: api.getProductDetail,
      data: {
        itemId: ticket.itemId,
        platform: ticket.platform
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        this.setState({
          detail: res.data.model
        })
        // 保存商品信息到radis 分享用
        Taro.request({
          url: api.saveShareGoodsInfo,
          data: {
            goodsInfo: JSON.stringify({
              detail: res.data.model,
              ticket: ticket
            }),
            itemId: ticket.itemId,
            platform: ticket.platform
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'User-Token': userToken,
            'Access-Token': accessToken,
            'Device-Id' : uuid
          }
        }).then(res => {
          if (res.data.success === true) {
            this.setState({
              sign: res.data.model
            })
          }
        })
      }
    })
  }

  getGoodsSend() {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    Taro.request({
      url: api.queryPddHotGods,
      data: {
        type: 1,
        page: 1,
        pageSize: 8
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then((res) => {
      if (res.data.success) {
        this.setState({
          goodsList: res.data.model.list
        })
      }
    })
  }

  changepic(e) {
    // 改变swiper下标
    let nowpage = e.detail.current + 1;
    this.setState({
      nowpage: nowpage
    })
  }

  onShareAppMessage() {
    // 分享参数修改
    const { chainUrl, ticket, sign, detail } = this.state as any
    let url, title
    if (ticket.platform === 'pingduoduo') {
      url = chainUrl.pagePath
      title = '拼多多'
    } else {
      url = (chainUrl.shortUrl || chainUrl.url)
      title = '京东'
    }
    wx.showToast({
      title : '正在分享',
      icon : 'loading'
    })
    return {
      title: `【${title}】券后￥${ticket.finalPrice}${ticket.originPrice ? `原价￥${ticket.originPrice}` : ''}${ticket.couponAmount ? ` 限量❗️${ticket.couponAmount}元优惠券` : ''}`,
      path: `/pages/middle/index?share=${encodeURIComponent(url)}&sign=${sign}&itemId=${ticket.itemId}&platform=${ticket.platform}`,
      imageUrl: detail.images[0]
    }
  }

  saveCanvasPic() {
    let ctx = wx.createCanvasContext('cvs');
    let sellPic = '../../assets/ychImages/sellItem.jpg',
      moneyPic = '../../assets/ychImages/sharemoney.png',
      shareNone = require('../../assets/ychImages/sharenone.png');
    ctx.drawImage(sellPic, 40, 0, 145, 145);
    ctx.drawImage(moneyPic, 0, 145, 225, 35);
    ctx.setFontSize(7);
    ctx.setFillStyle('#FFF');
    ctx.fillText('日常价:', 15, 160)
    ctx.fillText('￥158.00', 10, 170);
    ctx.stroke();
    ctx.setFillStyle('#FCEB91');
    ctx.fillText('鼻子劲爆价:', 95, 155)
    ctx.stroke();
    ctx.setFillStyle('#FFF'),
      ctx.fillText('日常价:', 190, 160);
    ctx.fillText('￥158.00', 185, 170);
    ctx.stroke();
    ctx.setFontSize(16);
    ctx.fillText('￥128.00', 75, 174);
    ctx.stroke();
    ctx.drawImage(shareNone, 45, 112, 136, 34)
    ctx.stroke();
    ctx.draw(false, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'cvs',
        success: (res) => {
          let path = res.tempFilePath;
          if (path) {
            this.setState({
              sharePic: path
            })
          }
        },
        fail: (res) => { console.log(res) }
      })
    });
  }
  goHome() {
    Taro.navigateTo({
      url: '../login/index'
    })
  }

  getRightMoney(str) {
    if (typeof (str) === 'string') {
      return str.split('.')[0];
    } else {
      return ''
    }
  }

  chainUrl() {
    // 转链
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    const { ticket } = this.state as any
    Taro.request({
      url: api.changeChain,
      data: {
        platform: ticket.platform,
        itemId: ticket.url,
        extendJson: JSON.stringify({
          couponUrl:
            ticket.couponInfo && ticket.couponInfo.couponClickUrl ? ticket.couponInfo.couponClickUrl : ''
        })
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        this.setState({
          chainUrl: res.data.model
        })
      }
    })
  }

  toBuy() {
    // 购买跳转小程序
    const { ticket, chainUrl } = this.state as any
    if (ticket.platform === 'pingduoduo') {
      Taro.navigateToMiniProgram({
        appId: 'wx32540bd863b27570',
        path: chainUrl.pagePath,
        envVersion: 'release'
      })
    } else {
      Taro.navigateToMiniProgram({
        appId: 'wx1edf489cb248852c',
        path: 'pages/proxy/union/union?isUnion=1&spreadUrl=' + encodeURIComponent((chainUrl.shortUrl || chainUrl.url)),
        envVersion: 'release'
      })
    }
  }
  todetails(item) {
    Taro.setStorage({
      key: 'detail',
      data: item
    }).then(() => {
      Taro.navigateTo({
        url: '../product/product1'
      })
    })
  }

  render() {
    const { nowpage, detail, ticket, goodsList } = this.state as any
    return (
      <View className='product1-container'>
        <ScrollView className='product1-container-itembox' scrollY>
          <View className='itemshowbox'>
            <View className='pageselectbox'><View className='nowpage'>{nowpage}</View>/{detail.images.length || 0}</View>
            <Swiper className='swiper' onChange={(e) => { this.changepic(e) }}>
              {
                detail.images.map((item, index) => {
                  return (
                    <SwiperItem className='swiperItem' key={`A${index}`}>
                      <Image className='img' src={item}></Image>
                    </SwiperItem>
                  )
                })
              }
            </Swiper>
          </View>
          <View className={`itemtitle${detail.platform === 'jingdong' ? ' jd' : ''}${detail.platform === 'pingduoduo' ? ' pdd' : ''}`}>
            {detail.itemName}
          </View>
          <View className='sellbox'>
            <View className='nowmoney'>￥
              <View className='moneylogo'>{ticket.finalPrice}</View>
            </View>
            {
              ticket.originPrice ?
                <View className='oldmoney'>￥{ticket.originPrice}</View>
                : null
            }
            <View className='havesell'>已抢: {ticket.saledNumber}</View>
          </View>
          {
            ticket.couponAmount ?
              <View className='couponbox' onClick={this.toBuy.bind(this)}>
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
          <View className='goodstell'>
            <View className="product-recommend-title">
              <View className="product-recommend-title-more" style="visibility:hidden"></View>
              <View className="product-recommend-title-text">好/物/推/荐</View>
              <View className="product-recommend-title-more"></View>
            </View>
            <View className='goodscontainer'>
              <View className='goodsbox'>
                <Swiper className='goodsendswiper' skipHiddenItemLayout={true} displayMultipleItems={2}>
                  {
                    goodsList.map((item, index) => {
                      return (
                        <SwiperItem className='goodsendswiperitem'>
                          <View className='goodsitem' key={`B${index}`} onClick={this.todetails.bind(this, item)}>
                            <Image src={item.itemPicUrl}></Image>
                            <View className='goodstitle'>
                              <View className={item.platform === 'jingdong' ? 'goodspaltform-jd' : 'goodspaltform-pdd'}></View>
                              <View className='goodsname'>{item.itemName}</View>
                            </View>
                            <View className='goodscoupondetail'>
                              <View className={item.couponAmount !== null ? 'goodscoupon' : 'goodscoupon nothave'}>{this.getRightMoney(item.couponAmount)}元券</View>
                              <View className='returnmoney'>补贴: ￥{item.commissionAmount}元</View>
                            </View>
                            <View className='goodsmoney'>
                              <View className='nowmoney'><View className='moneylogo'>￥</View>{item.finalPrice}</View>
                              {/* <View className='oldmoney'>￥{item.finalPrice}</View> */}
                              <View className='havebuy'>已抢:{item.saledNumber}</View>
                            </View>
                          </View>
                        </SwiperItem>
                      )
                    })
                  }
                </Swiper>
              </View>
            </View>
          </View>
          {/* <View className='store'>
            <View className='storetitle'>
              <View className='storelogo'>
                <Image src={require('../../assets/ychImages/PDD_Logo.png')}></Image>
              </View>
              <View className='storename'>罗莱家纺旗舰官网</View>
              <View className='gostore'>进店逛逛 ></View>
            </View>
            <View className='tellstore'>
              <View className='tellitem'>
                <View className='telltext'>宝贝描述：4.8 </View>
                <View className='telllev high'>高</View>
              </View>
              <View className='tellitem'>
                <View className='telltext'>宝贝描述：4.8 </View>
                <View className='telllev middel'>中</View>
              </View>
              <View className='tellitem'>
                <View className='telltext'>宝贝描述：4.8 </View>
                <View className='telllev small'>低</View>
              </View>
            </View>
          </View> */}
          <View className="product-detail-title">
            <View className="product-detail-title-text">商品详情</View>
          </View>
          <View className='showpic'>
            {
              (detail.platform === 'jingdong' ? detail.goodsDetailImages : detail.images).map((item, index) => {
                return (
                  <Image mode='widthFix' style="margin:0 auto; width:98%; " key={index} src={item}></Image>
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

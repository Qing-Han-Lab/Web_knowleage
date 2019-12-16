import Taro, { Component, Config } from '@tarojs/taro'
import { View, Input, Swiper, SwiperItem, Image, Button, ScrollView } from '@tarojs/components'
import api from '../../api/api'
import tips from '../../utils/tips'
import './index2.scss'
import { observer, inject } from '@tarojs/mobx'
import common from '../../utils/common'
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
      hotGoodPricelist: [],
      commentText: '',
      sharePic: '',
      title: '',
      numtype: 0,
      recommendList: [],
      userId: '',
      commentId: '',
      placeholder: '是时候发表评论了',
      inputFocus: false, // input聚焦
      replyUser: {

      } // 回复者信息
    }
  }
  componentWillMount() {
    this.getInfo();
    this.getComment()
    // setTimeout(() => {
    //   this.saveCanvasPic()
    // }, 1000);
  }
  componentDidMount() { }
  componentDidShow() { }
  changePage(e) {
    let nownum = e.detail.current;
    this.setState({
      nowpage: nownum
    })
  }

  chainUrl() {
    // 转链
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    const { detail } = this.state as any
    Taro.request({
      url: api.changeChain,
      data: {
        platform: detail.platform,
        itemId: detail.url,
        extendJson: JSON.stringify({
          couponUrl: detail.couponInfo && detail.couponInfo.couponClickUrl
            ? detail.couponInfo.couponClickUrl
            : ''
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
        this.saveGoodInfo()
      }
    })
  }

  saveGoodInfo() {
    // 保存信息到radis
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    const { detail } = this.state as any
    Taro.request({
      url: api.saveShareGoodsInfo,
      data: {
        goodsInfo: JSON.stringify({
          detail: detail,
        }),
        itemId: detail.itemId,
        platform: detail.platform
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

  getInfo() {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    Taro.request({
      url: api.getContentDetail,
      data: {
        contentId: this.$router.params.contentId,
        feedsLinkSource: this.$router.params.feedsLinkSource
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success) {
        this.setState({
          detail: res.data.model,
        }, () => {
          this.chainUrl()
        })
        this.gethotgoodprice()
      }
    })
  }
  gethotgoodprice() {
    // 获取热门好价
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    Taro.request({
      url: api.gethotgoodprice,
      data: {
        randomConut: 3,
        exContentId: this.$router.params.contentId
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res) {
        this.setState({
          hotGoodPricelist: res.data.model
        })
      }
    })
  }

  like() {
    // 点击喜欢
    const { detail } = this.state as any
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    if (accessToken === '' || userToken === '') {
      tips.showToast('请登录后再收藏！！！').finally(() => {
        Taro.switchTab({
          url: '../mine/index'
        })
      })
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
  changeVal(e) {
    this.setState({
      commentText: e.target.value
    })
  }

  sendComment() {
    // 回复评论
    const { commentText, recommendList, replyUser } = this.state as any
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    if (accessToken == '' && userToken == '') {
      tips.showToast('请登录后在评论！！！').finally(() => {
        Taro.switchTab({
          url: '../mine/index'
        })
      })
      return
    } else if (commentText.length === 0) {
      tips.showToast('评论内容不能为空！！！')
      return
    } else {
      let obj = {
        content: commentText,
        contentId: this.$router.params.contentId,
        commentId: ''
      } as any
      if (replyUser.userId) {
        obj.content = `回复 \r\b ${replyUser.nickName}\n\b ${
          obj.content
          }`
        obj.userId = replyUser.userId
        obj.commentId = replyUser.commentId
      }
      Taro.request({
        url: api.sendComment,
        data: obj,
        header: {
          'User-Token': userToken,
          'Access-Token': accessToken,
          'Device-Id' : uuid
        },
      }).then(res => {
        if (res.data.success === true) {
          if (replyUser.userId) {
            this.refreshItem(res.data.model)
          } else {
            recommendList.unshift(res.data.model)
            this.setState({
              commentText: '',
              recommendList
            })
          }
          tips.showToast('评论成功！！！')
        }
      })
    }
  }

  refreshItem(model) {
    // 刷新评论回复
    const { recommendList, replyUser } = this.state as any
    recommendList[replyUser.index].replies.unshift(model)
    this.setState({
      commentText: '',
      replyUser: {},
      placeholder: '是时候发表评论了！！'
    })
  }

  getComment() {
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    Taro.request({
      url: api.queryComment,
      data: {
        contentId: this.$router.params.contentId,
        offset: 0,
        limit: 5
      },
      header: {
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      },
    }).then(res => {
      if (res.data.success === true) {
        this.setState({
          recommendList: res.data.model
        })
      }
    })
  }

  replycut(commentId, userId, nickName, index, contentId) {
    this.setState({
      inputFocus: true,
      placeholder: `回复 ${nickName}`,
      replyUser: {
        commentId,
        userId,
        contentId,
        index,
        nickName
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
  saveCanvasPic() {
    const { list, sharePic } = this.state as any
    let oldPrice, nowPrice;
    oldPrice = parseInt(list.originPrice) >= 100 ? '￥' : ' ￥' + list.originPrice;
    nowPrice = parseInt(list.finalPrice) >= 100 ? '￥' : ' ￥' + list.finalPrice;
    console.log(parseInt(list.originPrice), list.finalPrice, '0000000000000000')
    let ctx = wx.createCanvasContext('cvs');
    console.log(sharePic, '11111111111111111')
    let sellPic = sharePic,
      moneyPic = require('../../assets/ychImages/sharemoney.png'),
      shareNone = require('../../assets/ychImages/sharenone.png');
    ctx.drawImage(sellPic, 40, 0, 145, 145);
    ctx.drawImage(moneyPic, 0, 145, 225, 35);
    ctx.setFontSize(7);
    ctx.setFillStyle('#FFF');
    ctx.fillText('日常价:', 15, 160)
    ctx.fillText(oldPrice, 10, 170);
    ctx.stroke();
    ctx.setFillStyle('#FCEB91');
    ctx.fillText('鼻子劲爆价:', 95, 155)
    ctx.stroke();
    ctx.setFillStyle('#FFF'),
      ctx.fillText('日常价:', 190, 160);
    ctx.fillText(oldPrice, 185, 170);
    ctx.stroke();
    ctx.setFontSize(16);
    ctx.fillText(nowPrice, 75, 174);
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
        fail: (res) => { console.log(res, 456) }
      })
    });
  }
  onShareAppMessage() {
    const { chainUrl, detail, sign } = this.state as any
    let url, title
    if (detail.platform === 'pingduoduo') {
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
    /*     Taro.navigateTo({
        url: `/pages/middle/index2?share=${encodeURIComponent(url)}&sign=${sign}&itemId=${detail.itemId}&platform=${detail.platform}&contentId=${this.$router.params.contentId}&feedsLinkSource=${this.$router.params.feedsLinkSource}`
      }) */
    return {
      title: `【${title}】券后￥${detail.finalPrice}${detail.originPrice ? `原价￥${detail.originPrice}` : ''}${detail.couponAmount ? ` 限量❗️${detail.couponAmount}元优惠券` : ''}`,
      path: `/pages/middle/index2?share=${encodeURIComponent(url)}&sign=${sign}&itemId=${detail.itemId}&platform=${detail.platform}&contentId=${this.$router.params.contentId}&feedsLinkSource=${this.$router.params.feedsLinkSource}`,
      imageUrl: detail.images[0]
    }
  }

  sendReply() {
    const { globalStore: { accessToken, userToken } } = this.props as any
    if (accessToken == '' && userToken == '') {
      tips.showToast('请登录后在评论！！！').finally(() => {
        Taro.switchTab({
          url: '../mine/index'
        })
      })
      return
    }
  }

  buyProduct() {
    // 购买
    const { detail, chainUrl } = this.state as any
    if (detail.platform === 'pingduoduo') {
      Taro.navigateToMiniProgram({
        appId: 'wx32540bd863b27570',
        path: chainUrl.pagePath,
        envVersion: 'release'
      })
    } else {
      Taro.navigateToMiniProgram({
        appId: 'wx1edf489cb248852c',
        path: 'pages/proxy/union/union?isUnion=1&spreadUrl=' + (chainUrl.shortUrl || chainUrl.url),
        envVersion: 'release'
      })
    }
  }


  render() {
    const { detail, list, hotGoodPricelist, recommendList, placeholder, inputFocus } = this.state as any
    // if (detail.recomendReason) {
    //   let recomendReason = detail.recomendReason
    //   WxParse.wxParse("recomendReason", "html", recomendReason, this.$scope, 5);
    // }
    const imageItems = detail.images.map((item, index) => {
      return (
        <SwiperItem className='swiperitem' key={`A${index}`}>
          <Image src={item}></Image>
        </SwiperItem>
      )
    })

    const commoditydetails = (
      <View className='whitebox'>
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
          {(detail.couponInfo && detail.couponInfo.discount && detail.couponInfo.discount !== '0.00') ? '(需用券)' : ''}
        </View>
        {/* common.getPlatformLogo(detail.platform) */}
        <View className={'product2-content-time ' + `${detail.platform === 'jingdong' ? 'jd' : (detail.platform === 'pingduoduo' ? 'pdd' : '')}`} >
          {detail.platform === 'jingdong' ? '京东' : (detail.platform === 'pingduoduo' ? '拼多多' : '')} | 
         {
            detail.publicTime ?
              tips.formatTime(detail.publicTime, 'MM-DD HH:mm') :
              ''
          }
        </View>

        {list.couponAmount ?
          <View className="product2-content-cert">
            <View className="product2-content-cert-subtitle">领券</View>
            <View className='product2-content-cert-item'>满{detail.couponInfo.quota}减{detail.couponInfo.discount}</View>
          </View> :
          ''
        }

        <View className="product2-content-context">
          <View className="product2-content-context-p">
          {tips.getRightText(`${detail.recomendReason}`)}
          </View>
          <View className="product2-content-context-p">{detail.goodsDetail ? detail.goodsDetail : ''}</View>
          <View className="product2-content-context-tip">商品价格有较强的时效性，有需要的话尽快下手哦！</View>
        </View>
      </View>
    )

    const hotList = hotGoodPricelist.map((it, index) => {
      return (
        <View key={`D${index}`} className='recommenditem' onClick={this.toDetails.bind(this, index)}>
          <View className='pic'>
            <Image src={it.itemPicUrl}></Image>
          </View>
          <View className='sellcontent'>
            <View className='selltitle'>{it.itemName}</View>
            <View className='moneycontent'>
              <View className='money'>
                ￥<View className='smallmoneylogo'>{it.finalPrice}</View>
              </View>
              {
                it.commissionAmount && it.commissionAmount! == '0.00' ?
                  <View className='returnmoney'>
                    <View className='returnlogo'></View>
                    <View className='smallmoneylogo2'>￥</View>
                    <View className='returnmoneynum'>{it.commissionAmount}</View>
                  </View> : null
              }
            </View>
            <View className='morecontent'>
              <View className={common.getPlatformLogo(it.platform)}>{common.getPlatformName(it.platform)} | {tips.formatTime(it.publicTime, 'MM-DD HH:mm')}</View>
              <View className='morecontent-right'>
                <View className='morecontent-right-like'>{it.favoriteTimes}</View>
                <View className='morecontent-right-massage'>{it.commentTimes}</View>
              </View>
            </View>
          </View>
        </View>
      )
    })

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
        <View className="product2-bottom-reply" onClick={() => { this.sendReply() }}>
          <View className="product2-bottom-reply-img"></View>
          <View className="product2-bottom-reply-text">{detail.commentTimes}</View>
        </View>
        <View className="product2-bottom-buy" onClick={this.buyProduct.bind(this)}>立即购买</View>
      </View>
    )

    const recommendLists = recommendList.map((it, index) => {
      return (
        <View className="reply-item" key={`D${index}`}>
          <View className="reply-item-box">
            <View className="reply-item-left">
              <Image src={it.sendUser.headUrl ? it.sendUser.headUrl : require('../../assets/ychImages/userhead.png')}></Image>
            </View>
            <View className="reply-item-right">
              <View className="reply-item-right-name">{it.sendUser.nickName}</View>
              <View className="reply-item-right-content">{it.comment}</View>
              <View className="reply-item-right-widget">
                <View className="reply-item-right-widget-time">{tips.formatTime(it.time, 'MM-DD HH:mm')}</View>
                <View className="reply-item-right-widget-reply" onClick={this.replycut.bind(this, it.commentId, it.sendUser.userId, it.sendUser.nickName, index, it.contentId)}>回复</View>
              </View>

              {
                it.replies.length > 0 ?
                  <View className="reply-item-right-reply" >
                    {

                      it.replies.map((item, index2) => {
                        return (
                          <View className="reply-item-right-reply-item" key={`E${index2}`}>
                            <View>
                              <View className="reply-item-right-reply-name">{item.sendUser.nickName}:</View>
                              {/* <View className='reply-item-right-reply-name huifu'>回复</View> */}
                              {/* <View className="reply-item-right-reply-name">{it.replies[index].sendUser.nickName}</View> */}
                              <View className="reply-item-right-reply-content">{item.reply}</View>
                            </View>
                            <View className="reply-item-right-reply-box">
                              <View className="reply-item-right-reply-box-date">{tips.formatTime(item.replyTime, 'MM-DD HH:mm')}</View>
                              <View className="reply-item-right-reply-box-huifu" onClick={this.replycut.bind(this, it.commentId, item.sendUser.userId, item.sendUser.nickName, index, it.contentId)}>回复</View>
                            </View>
                            <View className="reply-item-right-reply-xian"></View>
                          </View>

                        )
                      })
                    }
                    {/* <View className="reply-item-right-reply-more">查看更多回复</View> */}
                  </View>
                  : ''
              }

            </View>
          </View>
          <View className="reply-item-right-reply-xian"></View>
        </View>

      )
    })
    return (
      <View className='product2-container'>
        <ScrollView className='product2-container-goodscontent' scrollY>
          {
            commoditydetails
          }
          <View className='tellbox'>
            {
              recommendList.length > 0 ?
                <View className="re">
                  <View className="reply-title">评论「{detail.commentTimes}」</View>
                  <View className="reply">
                    {
                      recommendLists
                    }
                    {/* <View className="reply-item-all">查看更多评论</View> */}
                  </View>
                </View> :
                null
            }
          </View>
          <View className='recommendtitle'>热门好价</View>
          <View className='recommendbox'>{hotList}</View>
        </ScrollView>
        <View className='product2-container-buycontent'>
          <View className='replybox'>
            <Input placeholder={placeholder} type='text' focus={inputFocus} onInput={this.changeVal.bind(this)}></Input>
            {/* <View className='smell'></View> */}
            <View className='send' onClick={this.sendComment.bind(this)}>发送</View>
          </View>
          {
            buynav
          }
        </View>
      </View>
    )
  }
}

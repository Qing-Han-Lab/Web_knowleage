import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Text, ScrollView } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../api/api'
@inject('globalStore')
@observer

export default class Index extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarBackgroundColor: '#f7f7f7',
    navigationBarTitleText: '爆款',
  }

  constructor() {
    super(...arguments)
    this.state = {
      addLoading: false,
      menus: [
        {
          name: '拼多多',
          englishName: 'pingduoduo',
          active: true
        },
        {
          name: '京东',
          englishName: 'jingdong',
          active: false
        }
      ],
      subMenus: [],
      hotList: [],
      canel: 'pingduoduo',
      catId: '',
      subIndex: 0,
      curPage: 2,
      images: [],
      platform: 'pingduoduo',
      isShowSwiper: false,
      TopHeight: 0,
      loadLogo: true,
      addText: '正在加载...'
    }
  }

  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() {
    this.queryItemCats(true)
    this.queryDictionary()
  }

  componentDidHide() { }

  getCouponNum(str) {
    let end = str.indexOf('.');
    if (end !== -1) {
      return str.substring(0, end)
    }
    return str;
  }

  queryGoods(page = 1) {
    // 请求商品数据
    const { canel, catId, hotList } = this.state as any
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    let url = canel === 'pingduoduo' ? api.queryPDDThemeGoods : api.queryJDJingfenGoods
    Taro.request({
      url: url,
      data: {
        catId: catId,
        page: page,
        pageSize: 15
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
            let arr = hotList.concat(res.data.model.list)
            this.setState({
              hotList: arr,
              addLoading: false,
              loadLogo: false
            })
            if (res.data.model.list.length < 15) {
              this.setState({
                addText: '已经到底了~~~'
              })
            }
          }
        }
      }
    })
  }

  queryDictionary() {
    const { platform } = this.state as any;
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    // 获取图片
    Taro.request({
      url: api.queryDictionary,
      data: {
        code: 'mini_app',
        type: platform
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        this.setState({
          images: res.data.model.images
        }, () => {

        })
      }
    })
  }

  queryItemCats(first = false) {
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    let { subMenus, canel } = this.state as any
    // 获取目录列表
    Taro.request({
      url: api.queryItemCats,
      data: {
        platform: canel
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id': uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        let menus = res.data.model
        menus = menus.map((item) => {
          item.active = false
          return item
        })
        menus[0].active = true
        subMenus = menus
        this.setState({
          subMenus,
          catId: subMenus[0].catId
        }, () => {
          if (first) {
            this.queryGoods()
          }
        })
      }
    })
  }

  checkMenu(index) {
    // 切换搜索目录
    let { menus } = this.state as any
    let newPlatform = menus[index].englishName;
    menus = menus.map((item) => {
      item.active = false
      return item
    })
    menus[index].active = true
    let canel = 'pingduoduo'
    if (index === 0) {
      canel = 'pingduoduo'
    } else {
      canel = 'jingdong'
    }
    this.setState({
      menus,
      canel,
      hotList: [],
      curPage: 2,
      platform: newPlatform
    }, () => {
      this.queryItemCats(true)
      this.queryDictionary()
    })
  }

  toSearch() {
    // 跳转搜索页
    Taro.navigateTo({
      url: '../search/index?text=1'
    })
  }

  goDetail(item) {
    Taro.setStorage({
      key: 'detail',
      data: item
    }).then(() => {
      Taro.navigateTo({
        url: '../product/product1'
      })
    })
  }

  checkSubMenu(index) {
    // 切换小目录时
    let { subMenus } = this.state as any
    subMenus = subMenus.map((item) => {
      item.active = false
      return item
    })
    subMenus[index].active = true
    this.setState({
      subMenus,
      hotList: [],
      catId: subMenus[index].catId ? subMenus[index].catId : null,
      subIndex: index,
      curPage: 2,
      TopHeight: Math.random()
    }, () => {
      this.queryGoods()
    })

  }

  loadMore() {
    // 触底加载更多
    const { curPage } = this.state as any
    this.queryGoods(curPage)
    this.setState({
      curPage: curPage + 1,
      addLoading: true
    })
  }
  goPage(url) {
    console.log(url); // swiper广告页面跳转
  }
  isShowTopSwiper(e) { // 是否展示顶部的swiper
    let scrollview = e.target;
    if (scrollview.scrollTop > 230) { // 展示
      this.setState({
        isShowSwiper: true
      })
    }
    else {
      this.setState({
        isShowSwiper: false
      })
    }
  }
  render() {
    const { addText, menus, subMenus, hotList, images, isShowSwiper, TopHeight, loadLogo, addLoading } = this.state as any
    const menuItems = menus.map((item, index) => {
      return <View className={`hot-top-left-menu${item.active ? ' active' : ''}`} key={`A${index}`} onClick={this.checkMenu.bind(this, index)}>{item.name}</View>
    })
    const swiperItems = images.map((item, index) => {
      return <SwiperItem key={`B${index}`} onClick={() => { this.goPage(item.url) }}>
        <Image src={item.img}></Image>
      </SwiperItem>
    })
    const subMenuItems = subMenus.map((item, index) => {
      return <SwiperItem className="hot-menus-item" key={`C${index}`} onClick={this.checkSubMenu.bind(this, index)}>
        <Text className={`name ${item.active ? 'active' : ''}`}>{item.catName}</Text>
      </SwiperItem>
    })
    const productItems = hotList.slice(0, 3).map((item, index) => {
      return <View className="hot-product-item" key={`D${index}`} onClick={this.goDetail.bind(this, item)}>
        {<View className={`${index === 0 ? 'hot-product-item-icon1' : ''}${index === 1 ? ' hot-product-item-icon2' : ''}${index === 2 ? ' hot-product-item-icon3' : ''}`}></View>}
        <View className="hot-product-item-img">
          <Image src={item.itemPicUrl}></Image>
        </View>
        <View className="hot-product-item-info">
          <View className="hot-product-item-info-title">{item.itemName}</View>
          {
            item.shopName ?
              <View className="hot-product-item-info-sub">{item.shopName}</View> : <View className="hot-product-item-info-sub"></View>
          }
          <View className="hot-product-item-info-detail">
            <View className="hot-product-item-info-detail-pre">
              {item.couponAmount ? (<View className="hot-product-item-info-detail-pre-price1">{this.getCouponNum(item.couponAmount)}元券</View>) : ''}
              {(item.commissionAmount && item.commissionAmount !== '0.00') ? <View className="hot-product-item-info-detail-pre-price2">补贴:￥{item.commissionAmount}</View> : null}
            </View>
            <View className="hot-product-item-info-detail-buyed">已抢:{item.saledNumber > 10000 ?
              `${Number(item.saledNumber / 10000).toFixed(1)}万` : item.saledNumber}</View>
          </View>
          <View className="hot-product-item-info-buy">
            <View className="hot-product-item-info-buy-price">
              <View className="hot-product-item-info-buy-old">{item.originPrice ? item.originPrice : ''}</View>
              <View className="hot-product-item-info-buy-new">
                <View className='hot-product-item-info-buy-new-icon'>{item.finalPrice ? '￥' : ''}</View>
                <View className='hot-product-item-info-buy-new-money'>{item.finalPrice}</View>
              </View>
            </View>
            <View className="hot-product-item-info-buy-buynow">立即抢购</View>
          </View>
        </View>
      </View>
    })
    const productItems2 = hotList.slice(3).map((item, index) => {
      return <View className="hot-product2-item" key={`E${index}`} onClick={() => { this.goDetail(item) }}>
        <View className="hot-product2-img">
          <Image src={item.itemPicUrl}></Image>
        </View>
        <View className={`hot-product2-title${item.platform === 'jingdong' ? ' jd' : ''}${item.platform === 'pingduoduo' ? ' pdd' : ''}`}>{item.itemName}</View>
        <View className="hot-product2-info">
          {item.couponAmount ? <View className="hot-product2-info-pre">{this.getCouponNum(item.couponAmount)}元券</View> : (<View className=".hot-product2-info-pre-no">　</View>)}
          {item.commissionAmount && item.commissionAmount !== '0.00' ?
            (<View className="hot-product2-info-sub">补贴:{item.commissionAmount}</View>) : null
          }
        </View>
        <View className="hot-product2-price">
          <View className="hot-product2-price-left">
            <View className="hot-product2-price-left-new">
              <View className='hot-product2-price-left-new-icon'>{item.finalPrice ? '￥' : ''}</View>
              <View className='hot-product2-price-left-new-money'>{item.finalPrice}</View>
            </View>
            {item.originPrice ? <View className="hot-product2-price-left-old">￥{item.originPrice}</View> : ''}
          </View>
          <View className="hot-product2-price-right">已抢:{item.saledNumber > 10000 ? `${Number(item.saledNumber / 10000).toFixed(1)}万` : item.saledNumber}</View>
        </View>
      </View>
    })
    return (
      <View className="hot">
        <View className="hot-top">
          <View className='hot-top-box'>
            <View className="hot-top-left">
              {menuItems}
            </View>
            <View className="hot-top-right" onClick={this.toSearch.bind(this)}>请输入...</View>
          </View>
          {/* <Swiper
            className={isShowSwiper ? 'hot-menus toshow' : 'hot-menus'}
            skipHiddenItemLayout={true}
            displayMultipleItems={5}>
            {subMenuItems}
          </Swiper> */}
        </View>
        <ScrollView className='scrollview'
          lowerThreshold={250}
          scroll-y={true}
          onScrollToLower={this.loadMore.bind(this)}
          onScroll={(e) => { this.isShowTopSwiper(e) }}
          scrollTop={TopHeight}
        >
          {
            loadLogo ?
              <Image src={require("../../assets/ychImages/loading.gif")} className='loadbox'></Image> :
              null
          }
          <Swiper
            className='hot-swiper'
            indicatorColor='#999'
            indicatorActiveColor='#333'
            circular
            indicatorDots={images.length > 1 ? true : false}
            autoplay>
            {swiperItems}
          </Swiper>
          {
            subMenus.length > 5 ?
            <View className="hotmenus-box">
              <Swiper
                className={'hot-menus ' + `${isShowSwiper ? 'topbar' : ''}`}
                skipHiddenItemLayout={true}
                displayMultipleItems={5}>
                {subMenuItems}
              </Swiper>
            </View>
              : null
          }
          <View className={"hot-product"}>
            {productItems}
            {
              addLoading && hotList.length < 3 ? <View className='hot-loading'>正在加载...</View> : null
            }
          </View>
          <View className="hot-product2">
            {productItems2}
            {
              addLoading && hotList.length >= 3 ? <View className='hot-loading'>{addText}</View> : null
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, ScrollView } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../../api/api'
import tips from '../../../utils/tips'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '搜索'
  }

  static defaultProps = {
    keywords: '',
    platform: 'jingdong'
  }
  constructor() {
    super(...arguments)
    this.state = {
      searchList: [],
      pagenum: 1,
      productMenus: [
        {
          name: '综合',
          active: true,
          up: true,
          key: 'ZH'
        },
        {
          name: '销量',
          active: false,
          up: true,
          key: 'XL'
        },
        {
          name: '价格',
          active: false,
          up: true,
          key: 'JG'
        },
        {
          name: '佣金',
          active: false,
          up: true,
          key: 'YJ'
        }
      ],
      landing: false,
      lastCheckIndex: 0
    }
  }
  componentWillUpdate() { }
  componentWillMount() {
    this.getSearchResult()
  }
  componentDidMount() { }
  componentDidShow() { }

  getSearchResult() {
    // 搜索
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    const { pagenum, searchList, productMenus, landing } = this.state as any
    const { platform, keywords } = this.props as any
    // 去重
    if (landing === true) {
      return
    } else {
      this.setState({
        landing: true
      })
    }
    // 搜索条件
    let sequence = productMenus.filter((item) => {
      return item.active
    })
    let orderBy = sequence[0].up
      ? `${sequence[0].key}_DES`
      : `${sequence[0].key}_AES`
    let uuId = wx.getStorageSync('uuid');
    Taro.request({
      url: api.queryProducts,
      data: {
        platform: platform,
        keyword: keywords,
        page: pagenum,
        pageSize: 15,
        orderBy: orderBy
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
              pagenum: pagenum + 1,
              searchList: searchList.concat(res.data.model.list),
              landing: false
            })
          } else {
            this.setState({
              landing: false
            })
            tips.showToast('没有查询到商品')
          }
        } else {
          this.setState({
            landing: false
          })
          tips.showToast('没有查询到商品')
        }
      } else {
        this.setState({
          landing: false
        })
        tips.showToast('没有查询到商品')
      }
    })
  }

  toCheckProduct(index) {
    // 切换商品搜索条件
    let { productMenus, lastCheckIndex } = this.state as any
    productMenus = productMenus.map(item => {
      item.active = false
      return item
    })
    productMenus[index].active = true
    if (lastCheckIndex === index) {
      productMenus[index].up = !productMenus[index].up
    }
    this.setState({
      lastCheckIndex: index,
      pagenum: 1,
      searchList: []
    }, () => {
      this.getSearchResult()
    })
  }

  componentWillReceiveProps(newProps) {
    // props改变时触发
    const { platform, keywords } = this.props as any
    console.log(newProps)
    if (platform !== newProps.platform || keywords !== newProps.keywords) {
      this.setState({
        pagenum: 1,
        landing: false,
        searchList: []
      }, () => {
        this.getSearchResult()
      })
    }
  }

  toDetail(item) {
    // 跳转详情页
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
    const { searchList, productMenus } = this.state as any
    return (
      <View className='searchcommodity'>
        <View className='searchcommodity-navbox'>
          {
            productMenus.map((item, index) => {
              return <View className={`${item.up ? 'searchcommodity-navbox-text' : 'searchcommodity-navbox-textbottom'} ${item.active ? ' active' : ''}`} key={item.key} onClick={this.toCheckProduct.bind(this, index)}>{item.name}</View>
            })
          }
        </View>
        <ScrollView className='searchcommoditybox' scrollY lowerThreshold={100} scrollWithAnimation onScrollToLower={this.getSearchResult}>
          {
            searchList.map((it, index) => {
              return (
                <View key={`B${index}`} className='searchcommodity-contentbox' onClick={this.toDetail.bind(this, it)}>
                  <View className='searchcommodity-contentbox-img'>
                    <Image src={it.itemPicUrl} />
                  </View>
                  <View className='searchcommodity-contentbox-character'>
                    <View className='searchcommodity-contentbox-character-name'>{it.itemName}</View>
                    <View className='searchcommodity-contentbox-character-brief'>{it.shopName ? it.shopName : ''}</View>
                    <View className='searchcommodity-contentbox-character-nadiscountsme'>
                      <View className='searchcommodity-contentbox-character-nadiscountsme-left'>
                        {it.couponAmount && it.couponAmount !== '0.00' ?
                          <View className='searchcommodity-contentbox-character-nadiscountsme-ticket'>{it.couponAmount}元券</View>
                          : null
                        }
                        {
                          (it.commissionAmount && it.commissionAmount !== '0.00') ?
                            <View className='searchcommodity-contentbox-character-nadiscountsme-subsidy'>补贴:￥{it.commissionAmount}</View>
                            : null
                        }
                      </View>
                      <View className='searchcommodity-contentbox-character-nadiscountsme-rob'>已抢:{it.saledNumber}</View>
                    </View>
                    <View className='searchcommodity-contentbox-character-price'>
                      {
                        it.originPrice ?
                          <View className='searchcommodity-contentbox-character-price-bear'>￥{it.originPrice}</View>
                          : null
                      }
                      {
                        it.finalPrice ?
                          <View className='searchcommodity-contentbox-character-price-price'>
                            <View className='searchcommodity-contentbox-character-price-price-icon'>￥</View>
                            <View className='searchcommodity-contentbox-character-price-price-money'>{it.finalPrice}</View>
                          </View>
                          : null
                      }
                      <View className='searchcommodity-contentbox-character-price-btn'>立即抢购</View>
                    </View>
                  </View>
                </View>
              )
            })
          }
        </ScrollView>
      </View>
    )
  }

}
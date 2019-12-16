import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '好物推荐'
  }
  constructor() {
    super(...arguments)
    this.state = {
      list: [
        {
          img: '',
          name: '百草味 板栗仁80g百草味 板栗仁80g',
          discounts: 5,
          subsidy: 22,
          price: 5.6,
          dis: 88,
          rob: 12
        },
        {
          img: '',
          name: '百草味 板栗仁80g百草味 板栗仁80g',
          discounts: 5,
          subsidy: 22,
          price: 5.6,
          dis: 88,
          rob: 12
        },
        {
          img: '',
          name: '百草味 板栗仁80g百草味 板栗仁80g',
          discounts: 5,
          subsidy: 22,
          price: 5.6,
          dis: 88,
          rob: 12
        }
      ]
    }
  }
  componentDidMount() { }
  componentDidShow() { }
  render() {
    const { list } = this.state as any
    return (
      <View className='recommend'>
        {
          list.map(it => {
            return (
              <View className='recommend-box' key={it.id}>
                <View className='recommend-box-img'>
                  {/* <Image src={require('../../assets/images/home_commodity.png')} /> */}
                </View>
                <View className='recommend-box-name'>
                  <View className='recommend-box-name-left'></View>
                  <View className='recommend-box-name-right'>{it.name}</View>
                </View>
                <View className='recommend-box-discounts'>
                  <View className='recommend-box-discounts-left'>5元券</View>
                  <View className='recommend-box-discounts-right'>补贴:￥22</View>
                </View>
                <View className='recommend-box-price'>
                  <View className='recommend-box-price-left'>
                    <View className='recommend-box-price-left-icon'>￥</View>
                    <View className='recommend-box-price-left-numer'>5.90</View>
                  </View>
                  <View className='recommend-box-price-right'>
                    <View className='recommend-box-price-right-dis'>￥88</View>
                    <View className='recommend-box-price-right-rob'>以抢:12万</View>
                  </View>
                </View>
              </View>
            )
          })
        }
      </View>
    )
  }
}
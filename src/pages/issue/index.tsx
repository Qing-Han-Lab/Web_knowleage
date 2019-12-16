import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '常见问题'
  }
  constructor() {
    super(...arguments)
    this.state = {
      list: [
        {
          img: require('../../assets/images/issue_order.png'),
          title: '关于订单',
          listnum: [
            '1.已确认收货的订单失效了?',
            '2.为什么下单后佣金变少了呢？'
          ]
        },
        {
          img: require('../../assets/images/issue_money.png'),
          title: '关于佣金',
          listnum: [
            '1.什么时候可以提现?',
            '2.为什么下单后没有佣金？'
          ]
        },
        {
          img: require('../../assets/images/issue_ticket.png'),
          title: '关于优惠券',
          listnum: [
            '1.为什么领券提示优惠券已失效?',
            '2.领券下单一直无法跳转怎么解决？'
          ]
        },
        {
          img: require('../../assets/images/issue_grouping.png'),
          title: '关于分享',
          listnum: [
            '1.怎么分享优惠券？',
            '2.怎么邀请注册?'
          ]
        },
        {
          img: require('../../assets/images/issue_withdraw.png'),
          title: '关于提现',
          listnum: [
            '1.如何提现?',
            '2.为什么提现时显示“今日提现金额上限”'
          ]
        }, {
          img: require('../../assets/images/issue_withdraw.png'),
          title: '关于好价鼻子',
          listnum: [
            '1.好价鼻子APP可靠吗?',
            '2.好价鼻子要交钱吗？'
          ]
        },
      ]
    }
  }
  componentDidMount() { }
  componentDidShow() { }

  toDetails(index,key) {
    Taro.navigateTo({
      url: '../issuedetails/index?id=' + index+'&key='+key
    })
  }
  render() {
    const { list, listnum } = this.state as any
    return (
      <View className='issue'>
        {
          list.map((it, index) => {
            return (
              <View className='issue-box' key={`A${index}`} >
                <View className='issue-box-title'>
                  <View className='issue-box-title-text'>
                    <Image src={it.img} />
                    {it.title}</View>
                </View>
                {
                  list[index].listnum.map((item, key) => {
                    return (
                      <View key={`B${key}`} className='issue-box-text1' onClick={this.toDetails.bind(this,index,key)}>{item}</View>
                    )
                  })
                }
              </View>
            )
          })
        }

      </View>
    )
  }
}
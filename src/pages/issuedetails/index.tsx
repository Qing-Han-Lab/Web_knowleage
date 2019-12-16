import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
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
      index: '',
      key: '',
      list: [
        [
          {
            ask: '已经收货的订单为什么会失效了呢?',
            reply: '你好，确定收货的订单任然可以申请进行售后退货退款，这类订单属于维权订单，佣金会在提现的时候扣除哦'
          }, {
            ask: '为什么下单后佣金变少了呢?',
            reply: '你好哦，关于佣金不对问题可能存在以下几种原因，可以看一下哦 /1、商家临时调整了优惠券和佣金比例（数据没有及时同步）/2、分享A，买了B（需要检查两个订单的商品标题是否一致）',
          }
        ],
        [
          {
            ask: '什么时候可以提现?',
            reply: '好友购买后的收入是预计收入，只有当好友确认收货了以后的佣金收入才是确认收入，每月的25日结算上个自然月1-31日的已确认收货的佣金收入，结算完成后即可申请提现到支付宝哦。',
          }, {
            ask: '为什么下单后没有佣金?',
            reply: '【大家注意】购买时请注意以下几点,90%会得不到佣金哦/①领券后加入购物车或收藏之后购买/②使用集分宝、红包以及其他第三方优惠/③领券后拍了店铺的其他商品/④咨询店家时通过淘宝客服发的商品链接下单/⑤使用手机淘宝以外的任何手机APP下单/正确的下单方式:复制口令→打开手机淘宝→领券→选择规格→立即下单。',
          }
        ],
        [
          {
            ask: '为什么优惠券会失效了呢?',
            reply: '你好有一下几种情况哦！/1、商品太火爆优惠券已经被领完了/2、商家取消了商品优惠券具体的优惠券活动需要在淘宝咨询卖家呢',
            reply1: '',
            reply2: '',
          }, {
            ask: '领券下单一直无法跳转怎么解决?',
            reply: '1、有可能是您手机网络的问题,您切换一下网络试一下/2、您可以关闭APP,重新打开试试 /3、以上两种方法都不行时,有可能商品本身的原因,您可以联系我们官方客服,将问题反馈给客服哦!',
          }
        ],
        [
          {
            ask: '怎么分享优惠券?',
            reply: "在好价鼻子中，打开您想要分享的商品，下方会有一个'分享赚',点击后您可以分享了。"
          }, {
            ask: '怎么邀请注册?',
            reply: '你好，可以通过以下步骤进行邀请哦/1．打开好价鼻子一点击“我的＂页面一点击“邀请好友将邀请码和海报分享给好友一好友扫码下载后填写你的邀请码就可以了哦/2．也可以在手机自带商城中搜索“好价鼻子＂，下载后填写邀请码注册，部分安卓机型搜索不到的，可以在应用宝里面下载哦～',
          }
        ],
        [
          {
            ask: '如何提现?',
            reply: '在我的页面，点击提现就可以提现了',
          }, {
            ask: '为什么提现时显示今日提现金额上限?',
            reply: '亲，支付宝限额1天1000万，现在已经开始限额了哦可以过了当晚0点后再进行提现哦，给您带来不便之处，请理解哦！'
          }
        ],
        [
          {
            ask: '关于好价鼻子?',
            reply: '好价鼻子是一个零投入，无风险，可以长期发展作为一份事业的项目/好价鼻子团队来自阿里巴巴，腾讯，滴滴等国内知名互联网公司，目前已经服务超过百万用户，我们的电商端直接对接淘宝、天猫、京东、拼多多，返利佣金直接打到公司账户，由公司统一发放到个人，不存在加盟商卷款跑路的可能性，只要淘宝不倒闭你的佣金就一分都不会少。/加入好价鼻子，我们与你携手同行，开启省钱分享赚钱之路！',
          }, {
            ask: '好价鼻子要交钱码?',
            reply: '下载注册好价鼻子，以及推广好价鼻子平台上的优惠券和商品，都是完全免费的。自用免费，分享免费，升级plus会员免费，全程不收一分钱。',
          }
        ],
      ]
    }
  }
  componentDidMount() {
    this.setState({
      index: this.$router.params.id,
      key: this.$router.params.key
    })
  }
  componentDidShow() { }
  render() {
    const { list,index,key } = this.state as any
    return (
      <View className='issuedetails'>
        {
          index != '' || key != '' ?
            <View className='issuedetails-box'>

              <View className='issuedetails-box-title'>问：{list[index][key].ask}</View>
              <View className='issuedetails-box-text'>
                <View>答:</View>
                <View className='issuedetails-box-text-reply'>
                  {
                    list[index][key].reply.split('/').map((item, num) => {
                      return <View key={`A${num}`}>{item}</View>
                    })
                  }
                </View>
              </View>
            </View>
            : null
        }
      </View>
    )
  }
}
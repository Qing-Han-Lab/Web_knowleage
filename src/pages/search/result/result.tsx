import Taro, { Component } from '@tarojs/taro'
import { View, Image, ScrollView } from '@tarojs/components'
import './result.scss'
import { observer, inject } from '@tarojs/mobx'
import api from '../../../api/api'
import tips from '../../../utils/tips'
@inject('globalStore')
@observer

export default class Index extends Component {
  static defaultProps = {
    platform: 'jingdong',
    keywords: '',
    toHotSearch: () => { }
  }

  constructor(props) {
    super(props)
    this.state = {
      searchList: [],
      pagenum: 1,
      landing: false,
      moreSearchFlag: false
    }
  }


  componentWillMount() {
    this.getSearchList()
  }
  componentWillUpdate() { }
  componentDidMount() { }
  componentDidShow() { }

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
        this.getSearchList()
      })
    }
  }

  getSearchList() {
    // 搜索
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    const { pagenum, searchList, landing } = this.state as any;
    const { platform, keywords } = this.props as any
    // 去重
    if (landing === true) {
      return
    } else {
      this.setState({
        landing: true
      })
    }
    Taro.request({
      url: api.queryList,
      data: {
        platform: platform,
        keyword: keywords,
        page: pagenum,
        pageSize: 15
      },
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then((res) => {
      if (res.data.success === true) {
        if (res.data.model.list != null) {
          if (res.data.model.list.length > 0) {
            let arr = searchList
            arr = arr.concat(res.data.model.list)
            this.setState({
              searchList: arr,
              pagenum: pagenum + 1,
              landing: false
            })
          } else {
            tips.showToast('没有查询到数据')
            this.setState({
              landing: false,
              moreSearchFlag : true
            })
          }
        } else {
          this.setState({
            landing: false,
            moreSearchFlag : true
          })
          tips.showToast('没有查询到数据')
        }
      } else {
        this.setState({
          landing: false,
          moreSearchFlag : true
        })
        tips.showToast('没有查询到数据')
      }
    })
  }

  toDetail(item) {
    // 跳转详情页
    Taro.navigateTo({
      url: '../product/product2?contentId=' + item.contentId + '&feedsLinkSource=' + item.feedsLinkSource
    })
  }
  getMoreSearch() {
    this.props.toHotSearch()
  }

  render() {
    const { searchList, moreSearchFlag } = this.state as any
    return (
      <View className='result-container'>
        <ScrollView className='itembox' scrollY lowerThreshold={100} scrollWithAnimation onScrollToLower={() => { this.getSearchList() }}>
          {
            searchList.map((item, index) => {
              return (
                <View key={`B${index}`} className='recommenditem' onClick={this.toDetail.bind(this, item)}>
                  <View className='pic'>
                    <Image src={item.itemPicUrl}></Image>
                  </View>
                  <View className='sellcontent'>
                    <View className='selltitle'>{item.itemName}</View>
                    <View className='moneycontent'>
                      <View className='money'>
                        <View className='smallmoneylogo'>￥</View>{item.finalPrice}
                      </View>
                      {
                        (item.commissionAmount && item.commissionAmount !== '0.00') ?
                          <View className='returnmoney'>
                            <View className='returnlogo'></View>
                            <View className='smallmoneylogo2'>￥</View>
                            <View className='returnmoneynum'>{item.commissionAmount}</View>
                          </View> :
                          null
                      }
                    </View>
                    <View className='morecontent'>
                      <View className='paltform'>
                        {
                          item.platform === 'jingdong' ?
                            <Image src={require("../../../assets/images/home_icon.png")}></Image> :
                            <Image src={require("../../../assets/ychImages/PDD_Logo2.png")}></Image>
                        }
                         <View className='time'>{item.platform === 'jingdong' ? '京东' : '拼多多'}  | {tips.formatTime(item.publicTime, 'MM-DD HH:mm')}</View>
                      </View>
                      <View className='likeandmessage'>
                        <View className='like'>{item.favoriteTimes}</View>
                        <View className='massage'>{item.commentTimes}</View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })
          }
          {
            moreSearchFlag ?
              <View className='searchend-box'>
                <View className='searchnone'>
                  <Image src={require('../../../assets/ychImages/searchNone.png')}></Image>
                </View>
                <View className='searchtext'>没找到你想要的？试试看用商品搜索</View>
                <View className='tosearchbtn' onClick={() => { this.getMoreSearch() }}>
                  <View className='searchlogo'></View>
                  <View className='tosearch'></View>
                </View>
              </View> :
              null
          }
        </ScrollView>
      </View>
    )
  }
}
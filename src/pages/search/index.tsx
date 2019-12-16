import Taro, { Component, Config } from '@tarojs/taro'
import { View, Input, Image,Button } from '@tarojs/components'
import Searchcommodity from './searchcommodity/index'
import api from '../../api/api'
import './index.scss'
import { observer, inject } from '@tarojs/mobx'
import Result from '../search/result/result'
import tips from '../../utils/tips'
import { func } from 'prop-types'
@inject('globalStore')
@observer

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '搜索'
  }
  constructor() {
    super(...arguments)
    this.state = {
      del_show: false,
      searchflag: 0,
      showflag: false,
      flag: false,
      show: false,
      pastlist: [],
      navlist: [
        { name: '京东', active: true, platform: 'jingdong' },
        { name: '拼多多', active: false, platform: 'pingduoduo' },
      ],
      hotwordlist: [],
      keywords: '',
      platform: 'jingdong',
      searchValue: ''
    }
  }
  componentDidShow() {
    this.getRecord()
    this.getHotWord()
  }
  componentWillMount() {
    let num = Number.parseInt(this.$router.params.text);
    if (num) {
      if (num === 0) {
        this.setState({
          searchflag: 0
        })
      } else if (num === 1) {
        this.setState({
          searchflag: 1
        })
      }
    }
  }
  componentDidMount() {
  }


  cutstate(index) {
    const { navlist } = this.state as any
    navlist.map(it => {
      it.active = false
      return it
    })
    navlist[index].active = true
    this.setState({
      navlist: navlist,
      platform: navlist[index].platform
    })

  }
  del() {
    this.setState({
      del_show: false,
      showflag: false,
      searchValue : ''
    })
  }
  valueschange(e) {
    // 搜索词动态绑定
    if(e.target.value.trim()!==''){
      this.setState({
        del_show : true
      })
    }else{
      this.setState({
        del_show : false
      })
    }
    this.setState({
      searchValue: e.target.value
    })
  }
  toResult(text) {
    this.setState({
      searchValue: text,
      del_show : true
    }, () => {
      this.addlist()
    })
  }
  addlist() {
    const { searchValue } = this.state as any
    this.setState({
      keywords: searchValue,
      showflag: true
    })
  }
  delpastlist() {
    const { globalStore: { accessToken, userToken,uuid } } = this.props as any
    Taro.request({
      url: api.delrecord,
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        this.getRecord()
        this.setState({
          flag: false
        })
      } else {
        tips.showToast('删除失败')
      }
    })
  }
  switchstate() {
    this.setState({
      flag: true
    })
  }
  cancel() {
    this.setState({
      flag: false
    })
  }
  getRecord() {
    // 获取个人搜索历史记录
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    Taro.request({
      url: api.getsearchrecord,
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        this.setState({
          pastlist: res.data.model
        })
      }
    })
  }
  getHotWord() {
    // 获取搜索热词
    const { globalStore: { accessToken, userToken, uuid } } = this.props as any
    Taro.request({
      url: api.gethotword,
      header: {
        'content-type': 'application/json',
        'User-Token': userToken,
        'Access-Token': accessToken,
        'Device-Id' : uuid
      }
    }).then(res => {
      if (res.data.success === true) {
        this.setState({
          hotwordlist: res.data.model
        })
      }
    })
  }
  goMoreSearch(){ // 首页搜索搜不到时，跳转到爆款搜索
    console.log('哈哈哈哈哈')
    this.setState({
      searchflag : 1
    })
  }
  render() {
    const { platform, keywords, searchValue, del_show, navlist, pastlist, flag, showflag, searchflag, hotwordlist } = this.state as any
    const hotwordlists = hotwordlist.map((it, index) => {
      return (
        <View className='search-content-box-text' key={`B${index}`} onClick={this.toResult.bind(this, it)}>{it}</View>
      )
    })
    return (
      <View className='search'>
        {
          flag ?
            <View className='search-barrage'>
              <View className='search-barrage-box'>
                <View className='search-barrage-box-text'>确认清空历史搜索记录？</View>
                <View className='search-barrage-box-btn'>
                  <View className='search-barrage-box-btn-cancel' onClick={this.cancel.bind(this)}>取消</View>
                  <View className='search-barrage-box-btn-confirm' onClick={this.delpastlist.bind(this)}>确定</View>
                </View>
              </View>
            </View> :
            null
        }
        <View className='topbox'>
          <View className='search-frame'>
            <View className='search-frame-left'>
              <Input placeholder='请输入商品名称' onConfirm={this.addlist.bind(this)} value={searchValue} onInput={this.valueschange.bind(this)} type='text' />
              {
                del_show ?
                  <View className='search-del' onClick={this.del.bind(this)}></View> :
                  null
              }
            </View>
            <View className='search-frame-right' onClick={this.addlist.bind(this)}>搜索</View>
          </View>
          {
            searchflag===0?
            null:
            <View className='search-nva'>
            {
              navlist.map((it, index) => {
                return (
                  <View key={it.id} className={it.active ? 'search-nva-content' : ''} onClick={this.cutstate.bind(this, index)}>{it.name}</View>
                )
              })
            }
          </View>
          }
        </View>
        <View className="search-content1">
          {
            showflag === true ?
              <View className='resultbox'>
                {
                  searchflag === 0 ?
                    <Result platform={platform} keywords={keywords} toHotSearch={()=>{this.goMoreSearch()}}  /> :
                    <Searchcommodity platform={platform} keywords={keywords} />
                }
              </View> :
              <View className='search-content'>
                {
                  pastlist.length === 0 ?
                    null :
                    <View className='search-content-history'>
                      <View className='search-content-history-icon'>
                        <View className='search-content-history-icon-left'></View>
                        <View className='search-content-history-icon-right' onClick={this.switchstate.bind(this)}>
                        </View>
                      </View>
                      <View className='search-content-history-content'>
                        {
                          pastlist.map((it, index) => {
                            return <View className='search-content-history-content-text' onClick={this.toResult.bind(this, it)} key={`C${index}`}>{it}</View>
                          })
                        }
                      </View>
                    </View>
                }
                <View className='search-content-hot'></View>
                <View className='search-content-box'>
                  {hotwordlists}
                </View>
              </View>
          }
        </View>
      </View>
    )
  }
}
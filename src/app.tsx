import Taro, { Component, Config } from '@tarojs/taro'
import Index from './pages/home'
import { Provider, onError } from '@tarojs/mobx'
import globalStore from './store/global'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
const store = {
  globalStore
}

onError(error => {
  console.log('mobx global error listener:', error)
})

class App extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/home/index',
      'pages/hot/index',
      'pages/mine/index',
      'pages/issue/index',
      'pages/login/index',
      'pages/issuedetails/index',
      'pages/mobilelogin/index',
      'pages/search/index',
      'pages/invitelogin/index',
      'pages/product/product1',
      'pages/product/product2',
      'pages/recommend/index',
      'pages/middle/index',
      'pages/middle/index2',
      'pages/bindPhone/index',
      'pages/bindinvitecode/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    tabBar: {
      color: '#999999',
      selectedColor: "#FB2C68",
      backgroundColor: '#fff',
      borderStyle: 'white',
      position: 'bottom',
      list: [
        {
          pagePath: 'pages/home/index',
          text: '首页',
          iconPath: 'assets/tabIcon/tab_index.png',
          selectedIconPath: 'assets/tabIcon/tab_index_on.png'
        },
        {
          pagePath: 'pages/hot/index',
          text: '爆款',
          iconPath: 'assets/tabIcon/tab_hot.png',
          selectedIconPath: 'assets/tabIcon/tab_hot_on.png'
        },
        {
          pagePath: 'pages/mine/index',
          text: '我的',
          iconPath: 'assets/tabIcon/tab_mine.png',
          selectedIconPath: 'assets/tabIcon/tab_mine_on.png'
        }
      ]
    },
    navigateToMiniProgramAppIdList: [
      'wx1edf489cb248852c',
      'wx32540bd863b27570'
    ]
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index></Index>
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))

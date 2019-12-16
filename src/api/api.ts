let host = 'https://www.prices.biz'

export default {
  getItemList: host + '/hj/synchfeeds/queryFeedsList',
  sendIdentifyCode: host + '/api/middle/security/sendIdentifyCode', //获取验证码
  mobileLogin: host + '/hj/user/base/mobileLogin', // 检查验证码是否正确
  getUserInfo: host + '/hj/user/base/getUserInfo',// 获取用户信息
  home: host + '/hj/synchfeeds/queryFeedsList', //首页商品详情
  queryList: host + '/hj/content/minipro/home/queryList', // 首页
  getsearchrecord: host + '/hj/product/getMySearchHistory',  //获取历史搜索
  delrecord: host + '/hj/product/delMyHisSearchKeywords', //删除历史
  gethotword: host + '/hj/product/getHotSearchKeywords', //获取热门搜索
  getContentDetail: host + '/hj/content/feedsdetail/getContentDetail', //首页商品详情
  gethotgoodprice: host + '/hj/revelatrecom/feeds/queryMiniRandomHotFeedsList', //热门好价
  weixinUserLogin: host + '/api/middle/security/weixinUserLogin', // 微信登录
  getUserMoney: host + '/hj/user/account/getUserAccountInfo', // 获取用户账户信息
  queryProducts: host + '/hj/product/queryProducts',
  queryHotProducts: host + '/hj/product/queryHotProducts',
  queryItemCats: host + '/hj/product/queryItemCats',
  searchFavoriteProducts: host + '/hj/product/querySimilarProducts', // 好物推荐
  sendComment: host + '/hj/content/comment', // 发表评论
  favorite: host + '/hj/content/favorite', // 收藏
  queryComment: host + '/hj/content/queryComment', // 获取评论
  changeChain: host + '/hj/buy/changeChain', // 转链
  getProductDetail: host + '/hj/product/getProductDetail', //获取商品详情
  replydiscuss: host + '/hj/content/comment', // 评论回复
  queryDictionary: host + '/hj/comm/queryDictionary', // 数据字典
  queryPDDThemeGoods: host + '/hj/product/queryPDDThemeGoods', // 拼多多精选
  queryJDJingfenGoods: host + '/hj/product/queryJDJingfenGoods', // 京东精选
  queryPddHotGods: host + '/hj/product/queryPDDHotGoods', // 拼多多热销榜
  saveShareGoodsInfo: host + '/hj/share/saveShareGoodsInfo', // 保存信息到radis
  getShareGoodsInfo: host + '/hj/share/getShareGoodsInfo', // radis获取信息
  register: host + '/hj/user/base/registerUser', // 注册
  getUser: host+'/hj/user/profit/getUser', // 获取邀请用户信息
  bindInviteCode: host+'/hj/user/base/bindInviteCode', // 绑定邀请码
  genUserQrcode: host + '/hj/mapp/genUserQrcode' // 请求二维码
}

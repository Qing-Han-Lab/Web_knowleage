/**
 * 业务通用方法工具类
 *
 * @author guangzhong.wgz@yisutech.com
 * @time 2019-10-23
 * @version 1.0.1
 */

/**
 *
 * @param platform 平台属性
 */
const getPlatformLogo = (platform = '') => {
    if(platform === 'jingdong') {
      return '.platform-logo-jd'

    } else if(platform === 'pingduoduo') {
      return '.platform-logo-pdd'

    } else if(platform === 'tmall') {
      return '.platform-logo-tmall'

    } else if(platform === 'taobao') {
      return '.platform-logo-tb'

    } else {
      return ''
    }
}

/**
 *
 * @param platform 平台属性
 */
const getPlatformName = (platform = '') => {
  if(platform === 'jingdong') {
    return '京东'

  } else if(platform === 'pingduoduo') {
    return '拼多多'

  } else if(platform === 'tmall') {
    return '天猫'

  } else if(platform === 'taobao') {
    return '淘宝'

  } else {
    return ''
  }
}

export default {
  getPlatformLogo,
  getPlatformName
}

import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
/**
 * 
 * 吐司样式在展示时间走完之后才会执行其余逻辑
 * @param title 吐司内容
 * @param icon 吐司图标
 * @param duration 吐司展示时间
 * 
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  return new Promise((resolve, reject) => {
    Taro.showToast({
      title: title,
      icon: icon,
      duration: duration
    }).then(() => {
      setTimeout(() => {
        resolve()
      }, duration)
    }, (err) => {
      reject(new Error(err))
    })
  })
}
/**
 * 本函数用于格式化时间
 * 参考moment.js
 * @param time 时间戳时间
 * @param format 要格式化的格式 默认值'YYYY-MM-DD
 */

const formatTime = (time, format = 'YYYY-MM-DD') => {
  return dayjs(Number(time)).format(format)
}

/**
 * 去除数组中的空值 包括undefined null '' 等
 * @param arr 数组
 */
const bouncer = (arr) => {
  // Don't show a false ID to this bouncer.
  return arr.filter(function (val) {
    return !(!val || val === "");
  });
}

/**
 * 去除数组中的空值 包括undefined null '' 等
 * @param text 后台返的商品推荐理由
 */

const getRightText = (text) => {
  let newStr = '';
  let len = text.length;
  if ((text.indexOf('<') === -1) && (text.indexOf('>') === -1)) {
    return text
  }
  for (let i = 0; i < len; i++) {
    if (text.charAt(i) === '>') {
      for (let j = i; j < len; j++) {
        if (text.charAt(j) === '<') {
          let rightTextItem = text.substring(i + 1, j);
          if (rightTextItem !== '') {
            if (rightTextItem === '↵') {
              newStr += '';
            }
            else {
              newStr += rightTextItem;
            }
          }
          i = j;
          break;
        }
      }
    }
  }
  return newStr;
}

/**
 * 生成用户唯一的标识符，用来作为header参数在Taro.request里使用
 * @param id 返回的uuid
 */
const uuid = () => {
  let s = new Array();
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  let id = s.join("");
  return id;
}

export default {
  showToast,
  formatTime,
  bouncer,
  getRightText,
  uuid
}

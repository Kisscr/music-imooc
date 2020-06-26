// 格式时间的方法
module.exports = (date) => {
  let fmt = 'yyyy-MM-dd hh:mm:ss'

  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }

  // 匹配出年份
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, date.getFullYear())
  }

  // 匹配出剩下的部分
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)){
      fmt = fmt.replace(RegExp.$1, o[k] < 10 ? '0' + o[k] : o[k])
    }
  }

  return fmt
}
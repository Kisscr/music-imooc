// components/songSheet/songSheet.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    }
  },

  // 监听数据的变化
  observers: {
    ['playlist.playCount'](num) {
      // console.log(num)
      // console.log(this.formatCount(num, 2))
      this.setData({
        count: this.formatCount(num, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 歌单收听量
    count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到歌单详细信息页面
    goToMusicList() {
      wx.navigateTo({
        url: `../../pages/songlist/songlist?playlistId=${this.properties.playlist.id}`,
      })
    },


    // 格式化收听量的方法
    formatCount(num, pointer) {
      // 将数字转换为字符串，并将小数点后的数字去掉
      let numStr = num.toString().split('.')[0]
      if (numStr.length < 6) {
        // 如果小于十万位
        let float = numStr.substring(numStr.length - 4, numStr.length - 4 + pointer)
        return parseFloat(parseInt(numStr / 10000) + '.' + float) + '万'
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        // 如果是大于十万，小于千万
        let float = numStr.substring(numStr.length - 4, numStr.length - 4 + pointer)
        return parseFloat(parseInt(numStr / 10000) + '.' + float) + '万'
      } else if (numStr.length > 8) {
        // 如果大于亿
        let float = numStr.substring(numStr.length - 8, numStr.length - 8 + pointer)
        return parseFloat(parseInt(numStr / 100000000) + '.' + float) + '亿'
      }
    }
  }
})

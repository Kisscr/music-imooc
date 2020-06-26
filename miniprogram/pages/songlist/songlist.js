// pages/musiclist/nusiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 歌曲信息
    musiclist: [],
    listInfo: {}
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置导航标题
    wx.setNavigationBarTitle({
      title: '歌单',
    })
    wx.showLoading({
      title: '加载中',
      mask: 'true'
    })
    // 向music云函数发送请求
    wx.cloud.callFunction({
      name: 'music',
      data: {
        playlistId: options.playlistId,
        $url: 'musiclist'
      }
    }).then(res => {
      // console.log(res)
      const details = res.result.playlist
      this.setData({
        musiclist: details.tracks,
        listInfo: {
          nickname: details.creator.nickname,
          avatarUrl: details.creator.avatarUrl,
          playCount: this.formatCount(details.playCount, 2),
          description: details.description,
          coverImgUrl: details.coverImgUrl,
          listName: details.name
        }
      })
      wx.hideLoading()
      // 将当前歌单中的歌曲存到本地存储中
      wx.setStorageSync('musiclist', details.tracks)
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
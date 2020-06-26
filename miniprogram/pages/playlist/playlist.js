// pages/playlist/playlist.js
const MAX_LIMIT = 15

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 轮播图数据
    swipers: [
      {
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],
    // 歌单数据
    playlist: [],
    // 下拉是否还有数据
    isMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlaylist()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 下拉后清空当前数据
    this.setData({
      playlist: []
    })

    // 重新调用数据库内容
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.isMore) {
      this._getPlaylist()
    } else {
      wx.showToast({
        title: '没有数据啦~~~',
        icon: 'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title: '网易云音乐小程序版',
      imageUrl: this.data.swipers[1].url
    }
  },

  // 定义获取数据库中歌单的方法
  _getPlaylist() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        start: this.data.playlist.length,
        count: MAX_LIMIT,
        $url: 'playlist'  // 要调用的路由的路劲，传入准确路劲或者通配符*
      }
    }).then(res => {
      // console.log(res)
      if (res.result.data.length === 0) {
        wx.showToast({
          title: '没有数据啦~~~',
          icon: 'none'
        })
        this.setData({
          isMore: false
        })
        return
      }

      this.setData({
        playlist: [...this.data.playlist, ...res.result.data]
      })
      
      // 当请求到数据后，停止下拉刷新动作
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  }
})
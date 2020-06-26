const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHistoryMusic()
  },

  getHistoryMusic() {
    wx.showLoading({
      title: '努力获取中...',
    })
    // 获取当前用户的openId
    const openId = app.globalData.openId
    // 获取缓存中播放历史
    const history = wx.getStorageSync(openId)
    if (!history.length) {
      wx.hideLoading()
      wx.showModal({
        title: '温馨提示',
        content: '你还没有听歌哦~~',
        success: () => {
          wx.navigateBack({
            delta: 1,
          })
        }
      })
    } else {
      // 将缓存中musiclist里面的数据替换成播放历史中的数据
      wx.setStorage({
        data: history,
        key: 'musiclist',
      })
      this.setData({
        musicList: history
      })

      wx.hideLoading()
    }
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
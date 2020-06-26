import formatTime from '../../utils/formatTime'
const app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog: {},
    commentList: [],
    blogId: '',
    isShow: false   // 控制页面内容的加载,当成功获取数据后再赋值成true
  },

  // 评论完成后刷新当前页面
  handleRefreshCommentList() {
    this._getBlogDetail()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.blogId)
    this.setData({
      blogId: options.blogId
    })
    this._getBlogDetail()
  },

  // 调用获取博客详情的云函数
  _getBlogDetail() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'blog',
      data: {
        blogId: this.data.blogId,
        $url: 'detail'
      }
    }).then(res => {
      wx.hideLoading()
      let commentList = res.result.commentList.data
      // 格式化时间
      commentList.map(item => item.createTime = formatTime(new Date(item.createTime)))

      this.setData({
        commentList,
        blog: res.result.detail[0],
        isShow: true
      })

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
    return {
      title: this.data.blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${this.data.blogId}`,
      imageUrl: this.data.blog.imgs[0]
    }
  }
})
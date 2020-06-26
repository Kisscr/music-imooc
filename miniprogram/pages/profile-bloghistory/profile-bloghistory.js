
const MAX_LIMIT = 10
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: [],
    haveMore: true     // true表示有更多的数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getUserBlog()
    this.getUserBlogByApp()
  },

  // 通过云函数调用数据库，获取当前用户发布的博客
  getUserBlog() {
    wx.showLoading({
      title: '努力获取中...',
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getUserblog',
        skip: this.data.blogList.length,
        limit: MAX_LIMIT
      }
    }).then(res => {
      wx.hideLoading()

      if (res.result.length > 0) {
        this.setData({
          blogList: [...this.data.blogList, ...res.result]
        })
      } else {
        wx.showToast({
          title: '没有更多的数据啦~~',
          mask: true,
          icon: 'none'
        })
        this.setData({
          haveMore: false
        })
      }

    })
  },

  // 直接在小程序端调用数据库内容，由于数据库对用户的限制，只允许创建者读写，所以不需要openid查询
  getUserBlogByApp() {
    wx.showLoading({
      title: '努力获取中...',
    })
    db.collection('blog').skip(this.data.blogList.length).limit(MAX_LIMIT).orderBy('createTime', 'desc').get().then(res => {
      wx.hideLoading()
      // console.log(res)
      const blog = res.data
      blog.map(item => item.createTime = item.createTime.toString())
      if (res.data.length > 0) {
        this.setData({
          blogList: [...this.data.blogList, ...blog]
        })
      } else {
        wx.showToast({
          title: '没有更多的数据啦~~',
          mask: true,
          icon: 'none'
        })
        this.setData({
          haveMore: false
        })
      }
    })
  },

  // 点击跳转到评论页面
  handleToComment(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${id}`,
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
    if (this.data.haveMore) {
      // this.getUserBlog()
      this.getUserBlogByApp()
    } else {
      wx.showToast({
        title: '没有更多的数据啦~~',
        mask: true,
        icon: 'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    const blog = e.target.dataset.blog
    console.log(blog)
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`,
      imageUrl: blog.imgs[0]
    }
  }
})
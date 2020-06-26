// pages/blog/blog.js
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholder: '请输入关键字',
    showModal: false,
    blogList: [],    // blog数据集合
    moreBlog: true   // 是否有更多的博客，true为有
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 使用云函数调用云数据库
    this._getBlogList()

    // 在小程序端调用云数据库
    // const db = wx.cloud.database()
    // db.collection('blog').orderBy('createTime', 'desc').get().then(res => {
    //   console.log(res)
    //   // 此处有坑：在小程序端调用得到的createTime是对象格式，需要手动转换为字符串格式
    //   const data = res.data
    //   data.map(item => item.createTime = item.createTime.toString())
    //   this.setData({
    //     blogList: res.data
    //   })
    // })

  },

  // 获取云数据库中的博客数据
  _getBlogList(start = 0) {
    wx.showLoading({
      title: '加载中',
    })
    new Promise((reslove, reject) => {
      wx.cloud.callFunction({
        name: 'blog',
        data: {
          keyword,
          start,
          count: 10,
          $url: 'list',
        },
        success: reslove,
        fail: reject
      })
    }).then(res => {
      if (res.result.length > 0) {
        this.setData({
          blogList: [...this.data.blogList, ...res.result],
          moreBlog: true
        })

        wx.hideLoading()
        // 停止下拉刷新事件
        wx.stopPullDownRefresh()
      } else {
        wx.hideLoading()
        this.setData({
          moreBlog: false
        })
        wx.showToast({
          title: '到底啦！点击左上角发布新鲜事~',
          icon: "none"
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 点击发布按钮
  handleModalShow() {
    // 1. 判断用户是否授权登录
    wx.getSetting({
      success: (res) => {
        // 如果授权了则弹出发布界面
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              this.handleLoginSuccess({
                detail: res.userInfo
              })
            },
          })
        } else {
          // 没有授权则弹出授权页面
          this.setData({
            showModal: true
          })
        }
      },
    })
  },

  // 登录成功
  handleLoginSuccess(event) {
    const userInfo = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickname=${userInfo.nickName}&avatar=${userInfo.avatarUrl}`,
    })
  },

  // 登录失败
  handleLoginFail() {
    wx.showModal({
      title: '用户授权才能发布',
    })
  },

  // 点击跳转到评论页面
  handleToComment(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${id}`,
    })
  },

  // 搜索事件
  handleSearch(e) {
    // 1. 获取搜索关键字
    keyword = e.detail
    console.log(keyword)
    // 2. 清空博客列表数据
    this.setData({
      blogList: []
    })
    // 3. 调用云函数查询
    this._getBlogList()
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList: []
    })
    this._getBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.moreBlog) {
      this._getBlogList(this.data.blogList.length)
    } else {
      wx.showToast({
        title: '到底啦~点击左上角发布新鲜事~',
        icon: 'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    // console.log(event)
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      imageUrl: blogObj.imgs[0]
    }
  }
})
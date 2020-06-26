const MAX_UPLOAD_IMAGE = 9  // 一次可上传的图片的最大值

const db = wx.cloud.database()  // 初始化数据库

let content = ''    // 输入文字内容

let userInfo = {}   // 用户的信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordNums: 0,    // 已输入的最大值
    max_num: 140,    // 可输入的最大字数
    footerBottom: 0,    // 底部距离屏幕底部的距离
    images: [],    // 上传图片的url数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
  },

  // 输入文字时触发
  handleInput(e) {
    let wordNums = e.detail.value.length
    if (wordNums >= this.data.max_num) {
      wordNums = `最大字数不超过${this.data.max_num}`
    }
    this.setData({
      wordNums
    })
    content = e.detail.value
  },

  // 获取焦点事件
  handleFocus(e) {
    // 获取键盘的高度，模拟器里面的高度为0
    this.setData({
      footerBottom: e.detail.height
    })
  },

  // 失去焦点事件
  handleBlur() {
    this.setData({
      footerBottom: 0
    })
  },

  // 点击从本地相册选择图片或使用相机拍照。
  handleChooseImage() {
    // 可以选择的最大的照片数
    let max = MAX_UPLOAD_IMAGE - this.data.images.length
    wx.chooseImage({
      count: max,
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        })
        // 还可以再选几张
        max = MAX_UPLOAD_IMAGE - this.data.images.length
      },
    })
  },

  // 点击预览当前大图
  handlePreview(e) {
    console.log(e)
    wx.previewImage({
      urls: this.data.images,
      current: e.currentTarget.dataset.url
    })
  },

  // 点击删除当前照片
  handleDeleteImage(e) {
    const index = e.currentTarget.dataset.index
    this.data.images.splice(index, 1)
    this.setData({
      images: this.data.images
    })
  },

  // 点击发布上传图片
  handleUpload() {
    // 先判断是否有文字内容或者图片
    if (content.trim() === '' && this.data.images.length === 0) {
      wx.showModal({
        title: '提示',
        content: '内容或图片不能为空'
      })
      return
    }
    wx.showLoading({
      title: '发布中...',
      mask: true
    })
    let PromiseArr = []
    let fileIDs = []
    this.data.images.forEach((item, i) => {
      // 获取文件扩展名
      let suffix = /\.\w+$/.exec(item)[0]
      let p = new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + userInfo.nickname + '/' + Date.now() + '-' + parseInt(Math.random() * 1000000) + suffix,
          filePath: item,
          success: res => {
            fileIDs = [...fileIDs, res.fileID]
            reslove(res)
          },
          fail: err => {
            reject(err)
          }
        })
      })
      // 将每个promise对象存储到数组中
      PromiseArr.push(p)
    })
    // 当所有的promise对象都完成，存入到数据库
    Promise.all(PromiseArr).then(res => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          imgs: fileIDs,
          createTime: db.serverDate()     // 服务端的时间
        }
      })
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '发布成功',
      })
      // 返回blog页面，并且刷新
      wx.navigateBack()
      // getCurrentPages() 函数用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面。
      const pages = getCurrentPages()
      console.log(pages)
      // 获取上一个页面
      const prevPage = pages[pages.length - 2]
      prevPage.onPullDownRefresh()
       
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
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
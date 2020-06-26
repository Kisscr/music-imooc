let userInfo = {}   // 存储用户的信息
const db = wx.cloud.database()    // 初始化数据库
import formatTime from '../../utils/formatTime'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  options: {
    styleIsolation: "apply-shared"
  },
  /**
   * 组件的初始数据
   */
  data: {
    showModal: false,   // 登录组件是否显示
    showComment: false,  // 评论弹窗是否显示
    content: '',
  },
  
  // lifetimes: {
  //   ready() {
  //     console.log(this.properties.blog)
  //   }
  // },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击评论图标时
    handleComment() {
      // 1. 查询用户是否授权
      wx.getSetting({
        success: (res) => {
          // 如果没有授权，则弹出授权页面
          if (!res.authSetting['scope.userInfo']) {
            this.setData({
              showModal: true
            })
          } else {
            // 如果已授权，获取用户信息
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
              },
            })

            // 显示评论弹出层
            this.setData({
              showComment: true
            })
          }
        },
      })
    },

    // 登录成功
    handleLoginSuccess(e) {
      userInfo = e.detail
      this.setData(
        {
          showModal: false
        },
        // 先执行上面的赋值，再执行下面
        () => {
          this.setData({
            showComment: true
          })
        }
      )
    },

    // 登陆失败
    handleLoginFail() {
      // 弹出提示
      wx.showModal({
        title: '提示',
        content: '授权后才可评论'
      })
    },

    // 关闭弹出层后，清空已输入评论
    handleClearComment() {
      this.setData({
        content: ''
      })
    },

    // 点击发送时
    handleSend(event) {
      let { content } = event.detail.value
      let { nickName } = userInfo
      const tempId = '7TavTiOpSeowSy8jdxVxKtWlD_SuhRYrn6VHsw6pU9E'
      // 获取用户接收订阅消息的权限
      wx.requestSubscribeMessage({
        tmplIds: [tempId],
        success: res => {
          // console.log(res[tempId])
          // 只要没有被后台封禁，就可以评论成功
          // 'accept'表示用户同意订阅该条id对应的模板消息，'reject'表示用户拒绝订阅该条id对应的模板消息，'ban'表示已被后台封禁
          if (res[tempId] !== 'ban') {
            // 判断评论的内容是否合法
            if (content.trim() === '') {
              wx.showModal({
                title: '提示',
                content: '评论内容不能为空'
              })
            } else {
              // 发布评论
              wx.showLoading({
                title: '评论中',
                mask: true
              })
              // 插入数据库
              db.collection('blog-comment').add({
                data: {
                  content,
                  createTime: db.serverDate(),
                  blogId: this.properties.blogId,
                  avatar: userInfo.avatarUrl,
                  nickName: userInfo.nickName
                }
              }).then(res => {
                // 调用云函数，推送模板消息
                wx.cloud.callFunction({
                  name: 'sendMessage',
                  data: {
                    nickName,
                    content,
                    tempId,
                    blogId: this.properties.blogId
                  }
                }).then(res => {
                  // console.log(res)
                })

                wx.hideLoading()
                wx.showToast({
                  title: '评论成功',
                })
                this.setData({
                  showComment: false,
                  content: ''
                })
                // 抛出事件,让父元素刷新评论页面
                this.triggerEvent('refreshCommentList')
              })
            }
          }
        },

      })


    }
  }
})

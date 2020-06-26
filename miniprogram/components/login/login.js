// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showModal: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取用户授权
    handleGetUserInfo(event) {
      // console.log(event)
      const userInfo = event.detail.userInfo
      if(userInfo) {
        this.setData({
          showModal: false
        })
        // 登陆成功传递的事件
        this.triggerEvent('loginSuccess', userInfo)
      }else{
        // 登录失败传递的事件
        this.triggerEvent('loginFail')
      }
    }
  }
})

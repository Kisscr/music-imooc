//app.js
App({
  onLaunch: function () {
    this.checkUpdate()

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'kisscr',
        traceUser: true,
      })
    }

    this.getOpenId()

    this.globalData = {
      playingMusicId: -1,
      openId: -1
    }

  },
  // 设置当前正在播放音乐的id
  setPlayingMusicId(musicId) {
    this.globalData.playingMusicId = musicId
  },

  // 获取当前正在播放音乐的id
  getPlayingMusicId() {
    return this.globalData.playingMusicId
  },

  // 获取当前用户的openId，并存到缓存中
  getOpenId() {
    // 调用云函数获取
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      this.globalData.openId = res.result.openid
      const openId = res.result.openid
      const history = wx.getStorageSync(openId)
      if (!history) {
        wx.setStorageSync(openId, [])
      }
    })
  },

  // 检查小程序更新
  checkUpdate() {
    // 1. UpdateManager 对象，用来管理更新，可通过 wx.getUpdateManager 接口获取实例。
    const updateManager = wx.getUpdateManager()

    // 2. 监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发。
    updateManager.onCheckForUpdate(res => {
      // console.log(res)
      // 如果有新版本信息
      if (res.hasUpdate) {
        // 3. 监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用',
            success: res => {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })

    // 4. 新版本下载失败
    updateManager.onUpdateFailed(function (res) {
      console.log(res)
    })
  }
})
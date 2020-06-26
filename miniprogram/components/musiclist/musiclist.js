const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  pageLifetimes: {
    show() {
      this.setData({
        playingId: parseInt(app.getPlayingMusicId())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 当歌曲被点击时触发的方法
    onSelect(event) {
      const musicid = parseInt(event.currentTarget.dataset.musicid)
      const index = event.currentTarget.dataset.index
      this.setData({
        playingId: musicid
      })

      wx.navigateTo({
        url: `../../pages/player/player?musicid=${musicid}&index=${index}`,
      })
    }
  }
})

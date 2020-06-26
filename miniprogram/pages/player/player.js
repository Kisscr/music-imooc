
let musiclist = []    // 当前正在播放的歌单里的所有歌曲
let nowPlayingIndex = 0   // 正在播放歌曲的index

const backgroundAudioManager = wx.getBackgroundAudioManager()    // 获取全局唯一的背景音频管理器

const app = getApp()

Page({

  data: {
    picUrl: '',
    music: {},
    isPlaying: false,    // 歌曲是否播放，false为暂停
    isLyricShow: false,  // 歌词是否显示，false为不显示
    lyric: '',   // 歌词
    isSame: false   // 点击的是否是同一首歌, false表示不是同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取缓存中的歌曲数据
    musiclist = wx.getStorageSync('musiclist')
    nowPlayingIndex = options.index
    this._getNowPlaying(parseInt(options.musicid))
  },

  // 获取当前播放歌曲的详细信息
  _getNowPlaying(musicId) {
    if (musicId !== app.getPlayingMusicId()) {
      // 每次重新加载歌曲时，如果不是同一首歌，让上一首暂停
      backgroundAudioManager.stop()
      this.setData({
        isSame: false
      })
    } else {
      this.setData({
        isSame: true
      })
    }
    const music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    // 设置全局变量中播放音乐的id
    app.setPlayingMusicId(musicId)

    wx.showLoading({
      title: '歌曲加载中',
    })
    // 向云函数发送请求歌曲信息，并播放
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then(res => {
      // console.log(res.result)
      // 音乐管理控件
      if (!res.result.data[0].url) {
        // 如果当前歌曲是vip歌曲
        wx.showToast({
          title: '此歌曲为VIP歌曲，您没有权限',
          icon: 'none',
          mask: true,
          success: () => {
            setTimeout(() => {
              this.handleNext()
            }, 1000);
          }
        })
        return
      }
      // 如果点击的不是同一首歌曲才需要重新赋值
      if (!this.data.isSame) {
        backgroundAudioManager.src = res.result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 获取当前正在播放的歌曲
        const playingmusic = musiclist[nowPlayingIndex]
        // console.log(playingmusic)
        // 获取当前用户的openId
        const openId = app.globalData.openId
        // 获取播放列表缓存中数据
        let historyMusic = wx.getStorageSync(openId)
        let isSame = false    // 播放历史中是否有该歌曲，false为没有
        for (let item of historyMusic) {
          if (item.id === playingmusic.id) {
            isSame = true
            break
          }
        }
        // 如果播放历史中没有这首歌
        if (!isSame) {
          // 将当前歌曲添加到第一首
          historyMusic.unshift(playingmusic)
          wx.setStorage({
            data: historyMusic,
            key: openId,
          })
        } else {
          // 如果播放历史中有这首歌，先删除当前歌曲，再将当前歌曲添加到第一首
          historyMusic = historyMusic.filter(item => item.id !== playingmusic.id)
          historyMusic.unshift(playingmusic)
          wx.setStorage({
            data: historyMusic,
            key: openId,
          })
        }
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
    })

    // 发送请求获取歌词
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'lyric'
      }
    }).then(res => {
      const lrc = JSON.parse(res.result).lrc
      // console.log(lrc)
      let lyric = '暂无歌词'
      if (lrc) {
        lyric = lrc.lyric
      }
      this.setData({
        lyric
      })
    })
  },

  // 当后台音乐播放时触发的自定义事件
  handleMusicPlay() {
    this.setData({
      isPlaying: true
    })
  },

  // 当后台音乐暂停时触发的自定义事件
  handleMusicPause() {
    this.setData({
      isPlaying: false
    })
  },

  // 点击播放或者暂停
  togglePlaying() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 点击上一首
  handlePrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    let nowMusicId = musiclist[nowPlayingIndex].id
    this._getNowPlaying(nowMusicId)
  },

  // 点击下一首
  handleNext() {
    nowPlayingIndex++
    if (nowPlayingIndex >= musiclist.length) {
      nowPlayingIndex = 0
    }
    let nowMusicId = musiclist[nowPlayingIndex].id
    this._getNowPlaying(nowMusicId)
  },

  // 点击切换歌词和封面的显示
  handleChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  // 接收子组件传来的歌曲播放当前时间
  handleTimeUpdate(event) {
    // console.log(event)
    let { currentTime } = event.detail

    // 获取歌词组件，调用歌词组件内的方法
    this.selectComponent('.lyric').lyricScroll(currentTime)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
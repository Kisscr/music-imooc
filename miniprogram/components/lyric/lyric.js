// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isHidden: {
      type: Boolean,
      value: false
    },
    lyric: String
  },
  observers: {
    lyric(lrc) {
      if (lrc === '暂无歌词') {
        this.setData({
          lrcList: [
            {
              lrc: '纯音乐，请欣赏',
              time: 0
            }
          ]
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: -1,
    scrollTop: 0
  },
  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success(res) {
          // 小程序中，屏幕宽度为750rpx
          // 换算一行歌词的高度
          lyricHeight = res.screenWidth / 750 * 64
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 格式化歌词的方法
    _parseLyric(strLrc) {
      let lrcArr = strLrc.split('\n')
      // 存储歌词的数组
      let lrcList = []
      lrcArr.forEach(item => {
        // 1. 匹配分离出每句歌词的时间
        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g)
        if (time !== null) {
          // 2. 通过时间将歌词分离出来
          let lrc = item.split(time)[1]

          // 3. 先将时间继续分离出来，再将时间转换为秒数
          let newTime = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          let timeSecond = parseInt(newTime[1]) * 60 + parseInt(newTime[2]) + parseInt(newTime[1]) / 1000

          lrcList.push({
            lrc,
            time: timeSecond
          })
        }
      })

      this.setData({
        lrcList
      })
    },

    // 歌词滚动的方法
    lyricScroll(currentTime) {
      let { lrcList } = this.data
      if (lrcList.length === 0) {
        return
      }
      // 如果进度条直接被拉到结尾，且当前播放时间大于最后一句歌词的时间
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex !== -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: (lrcList.length - 1) * lyricHeight
          })
        }
      }

      for (let i = 0; i < lrcList.length; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    }
  }
})

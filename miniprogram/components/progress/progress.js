
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1   // 当前的秒数
let duration = 0  // 表示当前歌曲的总时长
let isMoving = false  // 表示当前进度条是否在拖拽，解决了当进度条拖动的时候和updatatime事件有冲突的问题
let timer = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    moveDis: 0,
    progress: 0
  },

  // 组件的生命周期函数
  lifetimes: {
    ready() {
      if (this.properties.isSame) {
        this._setTime()
      }
      this._getMoveDis()
      this.bindBGMEvent()
    },
    detached() {
      clearTimeout(timer)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 当进度条发生改变时触发
    handleProgressChange(event) {
      // console.log(event)
      // 如果当前移动的方式是拖动
      if (event.detail.source === 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.moveDis = event.detail.x
        isMoving = true
      }
    },

    // 当拖拽进度条停止后
    handleTouchEnd() {
      const currentTimeFmt = this._dataFormat(backgroundAudioManager.currentTime)
      // 需要在触摸结束后设置值
      this.setData({
        progress: this.data.progress,
        moveDis: this.data.moveDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      // 设置当前歌曲的进度，参数为秒
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    // 获取进度条的宽度和进度点的宽度
    _getMoveDis() {
      const query = this.createSelectorQuery()
      query.select('.movable_area').boundingClientRect()
      query.select('.movable_view').boundingClientRect()
      query.exec(rect => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },

    // 绑定音乐事件
    bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        // 小程序的坑：拖拽结束触发end后，可能还会触发change，所以需要在歌曲每次播放时，重新给isMoving设置成false，否则进度条就不动了
        isMoving = false
        // 后台音乐播放 时发送事件
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        // console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        // 后台音乐暂停时发送事件
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        // console.log('onWaiting')
      })

      // 监听当前音乐是否能播放
      backgroundAudioManager.onCanplay(() => {
        // 因为有概率获取到的时间是undefined,所以需要判断
        if (typeof backgroundAudioManager.duration !== 'undefined') {
          this._setTime()
        } else {
        timer = setTimeout(() => {
            this._setTime()
          }, 1000);
        }
      })

      // 监听歌曲的播放
      backgroundAudioManager.onTimeUpdate(() => {
        // 如果当前进度条不在移动了，才触发onTimeUpdate
        if (!isMoving) {
          // console.log('onTimeUpdate')
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration

          // 获取当前时间的秒数
          const sec = currentTime.toString().split('.')[0]

          // 一秒内只赋值一次
          if (sec !== currentSec) {
            // console.log(currentTime)
            const currentTimeFmt = this._dataFormat(currentTime)
            this.setData({
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
              // 进度条走的距离
              moveDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              // 进度条走的百分比
              progress: currentTime / duration * 100
            })

            // 赋值给当前时间
            currentSec = sec

            // 将当前时间通过自定义事件发送出去
            this.triggerEvent('timeUpdate', { currentTime })
          }
        }
      })

      // 当音乐结束时触发
      backgroundAudioManager.onEnded(() => {
        // console.log('onEnded')
        // 向父元素发送自定义事件，当音乐结束时，自动播放下一首
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
        wx.showToast({
          title: '错误' + res.errCode,
        })
      })
    },

    // 重新获取总时长的方法
    _setTime() {
      duration = backgroundAudioManager.duration
      // 调用格式化时间的方法
      const durationFmt = this._dataFormat(duration)
      
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },

    // 格式化时间的方法
    _dataFormat(second) {
      // 分钟
      const min = Math.floor(second / 60)
      const sec = Math.floor(second % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },

    // 补0的方法
    _parse0(num) {
      return num < 10 ? '0' + num : num
    }
  }
})

// components/blog-card/blog-card.js
import formatTime from '../../utils/formatTime'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: {
      type: Object,
      value: {}
    }
  },

  observers: {
    // 监听发布时间，并且格式化
    ['blog.createTime'](val){
      this.setData({
        _createTime: formatTime(new Date(val))
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: ''
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击预览图片
    handlePreview(e) {
      console.log(e)
      let index = e.currentTarget.dataset.index
      const imgs = this.properties.blog.imgs
      wx.previewImage({
        urls: imgs,
        current: imgs[index]
      })
    }
  }
})

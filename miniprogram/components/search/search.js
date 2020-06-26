// components/search/search.js
let keywords = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: 'String',
      value: '请输入关键字'
    }
  },
  externalClasses: ['iconfont', 'icon-sousuo'],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleInput(e){
      // console.log(e.detail. value)
       keywords = e.detail. value
    },

    // 点击搜索按钮发送事件，并且将搜索关键字发送出去
    handleSearch() {
      // console.log(keywords)
      this.triggerEvent('search', keywords)
    }

  }
})

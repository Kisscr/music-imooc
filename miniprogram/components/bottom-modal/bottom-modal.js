// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showModal: Boolean
  },
  options: {
    styleIsolation: 'apply-shared',   // 使组件内部可以使用外部的样式
    multipleSlots: true   // 启用多个插槽
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
    // 点击弹出层关闭按钮
    handleModalClose() {
      this.setData({
        showModal: false
      })

      this.triggerEvent('clearComment')
    },
  }
})

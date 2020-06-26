// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: cloud.getWXContext().OPENID,
      width: 450
      // lineColor: {
      //   'r': 68,
      //   'g': 126,
      //   'b': 57
      // },
      // isHyaline: true   背景透明
    })
    // return result 

    // 将获取到的buffer二级制数据通过上传到云存储转换为图片格式
    const upload = await cloud.uploadFile({
      cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
      fileContent: result.buffer
    })

    return upload.fileID

  } catch (error) {
    return error
  }

  
}
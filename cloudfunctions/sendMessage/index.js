// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: `/pages/blog-comment/blog-comment?${event.blogId}`,
      data: {
        thing1: {
          value: event.nickName
        },
        thing2: {
          value: event.content
        }
      },
      templateId: event.tempId,
      miniprogramState: 'developer'
    })
    return result
  } catch (error) {
    return error
  }

}
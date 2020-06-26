// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

// 初始化数据库
const db = cloud.database()
const blogCollection = db.collection('blog')
const commentCollection = db.collection('blog-comment')

// 定义单次最大查询条数
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  // 获取博客列表的云函数
  app.router('list', async (ctx, next) => {
    const keyword = event.keyword
    // 初始化查询条件
    let w = {}
    // 判断是否有关键字
    if (keyword.trim() != '') {
      w = {
        content: new db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }
    ctx.body = await blogCollection.where(w).skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then(res => {
      return res.data
    })
  })

  // 获取博客详情的云函数
  app.router('detail', async (ctx, next) => {
    let { blogId } = event
    // 详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then(res => {
      return res.data
    })

    // 评论查询
    // 1. 获取评论总条数
    const countResult = await commentCollection.count()
    const total = countResult.total
    // 2. 定义存放评论的对象
    let commentList = {
      data: []
    }
    if (total > 0) {
      // 3. 计算查询次数
      const count = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      // 4. 查询
      for (let i = 0; i < count; i++) {
        let promise = await commentCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
          blogId
        }).orderBy('createTime', 'desc').get()

        // 将每个promise对象存入到数组中
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        // 将每个promise对象返回的值累加到一个数组里
        commentList = ((await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: [...acc.data, ...cur.data]
          }
        }))
      }
    }

    ctx.body = {
      detail,
      commentList
    }
  })

  // 获取当前用户的所有博客
  app.router('getUserblog', async (ctx, next) => {
    const { OPENID } = cloud.getWXContext()
    ctx.body = await blogCollection.where({
      _openid: OPENID
    }).skip(event.skip).limit(event.limit).orderBy('createTime', 'desc').get().then(res => {
      return res.data
    })


    // 自己写的方法
    // 定义一个存放播放数据的对象
    // let blogList = {
    //   data: []
    // }
    // // 获取当前用户发布的博客总数
    // const countRes = await blogCollection.where({
    //   _openid: OPENID
    // }).count()
    // const userBlogTotal = countRes.total
    // // 如果数据库中有当前用户的博客
    // if (userBlogTotal > 0) {
    //   // 获取总博客数
    //   const blogTotal = await blogCollection.count()
    //   const { total } = blogTotal
    //   // 计算出最大查询次数
    //   const count = Math.ceil(total / MAX_LIMIT)
    //   let task = []

    //   for (let i = 0; i < count; i++) {
    //     let promise = await blogCollection.where({
    //       _openid: OPENID
    //     }).skip(i * 100).limit(MAX_LIMIT).orderBy('createTime', 'desc').get()
    //     task.push(promise)
    //   }
    //   if (task.length > 0) {
    //     blogList = (await Promise.all(task)).reduce((acc, cur) => {
    //       return {
    //         data: [...acc.data, ...cur.data]
    //       }
    //     })
    //   }
    // }
    // ctx.body = blogList

  })

  return app.serve()
}
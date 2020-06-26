// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 初始化云数据库
const db = cloud.database()

const rp = require('request-promise')

// 请求数据的地址
const URL = 'http://musicapi.xiecheng.live/personalized'

// 获取数据库中的内容
const playlistCollection = db.collection('playlist')

// 最多调用数据库多少条数据
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  // 数据库中的歌单数据
  // const list = await playlistCollection.get()
  // 由于云函数每次从数据库中最多只能获取100条数据，需要多次调用云数据库中的数据
  // 获取需要请求的次数
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const times = Math.ceil(total / MAX_LIMIT)
  // 创建一个空数组，用来存放所有的promise
  const tasks = []
  for (let i = 0; i < times; i++) {
    let promise = await playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 创建空的数据库数据
  let list = {
    data: []
  }
  // 当所有的异步任务都完成了
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  // 请求到的歌单数据
  const playlist = await rp(URL).then(res => {
    // 将获取到的数据转换为对象的格式
    return JSON.parse(res).result
  })

  let newData = []
  // 对比两个歌单数据是否有重复项，只取不重复项
  for (let playlistItem of playlist) {
    let flag = true
    for (let listItem of list.data) {
      if (playlistItem.id === listItem.id) {
        // 如果是同一项，则跳出循环
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(playlistItem)
    }
  }

  // 由于云数据库中的内容只能一条一条插入，所以需要遍历插入
  for (let item of newData) {
    await playlistCollection.add({
      data: {
        ...item,
        createTime: db.serverDate()   // 记录当前插入数据的服务器时间
      }
    }).then(res => {
      console.log('插入成功')
    }).catch(err => {
      console.log('插入失败')
    })
  }

  return newData.length
  // return newData
}
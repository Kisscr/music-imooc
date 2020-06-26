// 云函数入口文件
const cloud = require('wx-server-sdk')

// 引入tcb-router
const TcbRouter = require('tcb-router')

const rp = require('request-promise')

// 设置基础url
const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {  
  const app = new TcbRouter({
    event
  })

  // 获取歌单信息的路由
  app.router('playlist', async(ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res
    })
  })

  // 获取歌单里的歌曲信息路由
  app.router('musiclist', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId)).then(res => {
      return JSON.parse(res)
    })
  })  

  // 获取歌曲播放的url
  app.router('musicUrl', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then(res => {
      return JSON.parse(res)
    })
  })

  // 获取当前歌曲的歌词
  app.router('lyric', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`).then(res => {
      return res
    })
  })

  return app.serve()
} 
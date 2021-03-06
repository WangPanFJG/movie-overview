const Koa = require('koa')
const views = require('koa-views')
const { resolve } = require('path')
const { connect, initSchemas, initAdmin  } = require('./database/init')
const mongoose = require('mongoose')

;(async () => {
  await connect()

  initSchemas() // 初始化Schemas

  await initAdmin() // 创建新用户

  // 测试一下是否创建成功
  // const Movie = mongoose.model('Movie')
  // const movies = await Movie.find({})
  // console.log('movies', movies)

  // require('./tasks/movie') // require  movie.js, 同时就会执行
  // require('./tasks/api')
  // require('./tasks/trailer')
  // require('./tasks/qiniu')
})()

const app = new Koa()

app.use(views(resolve(__dirname, './views'), {
  extension: 'pug'
}))

app.use(async (ctx, next) => {
  await ctx.render('index', {
    you: 'Luke',
    me: 'Scott'
  })
})

app.listen(4455)
const Koa = require('koa')
// const ejs = require('ejs')
// const pug = require('pug')
const views = require('koa-views')

const { resolve } = require('path')

const app = new Koa()
// const { html, ejsTpl, pugTpl } = require('./tpl')

app.use(views(resolve(__dirname, './views'), {
  extension: 'pug' // 指定模板为pug
}))
app.use(async (ctx, next) => {
    await ctx.render('index', { // index.pug
      you: 'views-pug',
      me: 'main'
    })
    // 由于引入了views, 所以此时render方法已经被views挂载到了ctx上
})
// app.use(async (ctx, next) => {
//   ctx.type = 'text/html; charset=utf-8'
//   // ctx.body = ejs.render(ejsTpl, {
//   //   you: 'look',
//   //   me: 'main'
//   // })
//   ctx.body = pug.render(pugTpl, {
//     you: 'pug',
//     me: 'main'
//   })
// })

app.listen(7777)
const Koa = require('koa')
const ejs = require('ejs')
const pug = require('pug')
const app = new Koa()
const { html, ejsTpl, pugTpl } = require('./tpl')

app.use(async (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  // ctx.body = ejs.render(ejsTpl, {
  //   you: 'look',
  //   me: 'main'
  // })
  ctx.body = pug.render(pugTpl, {
    you: 'pug',
    me: 'main'
  })
})

app.listen(7777)
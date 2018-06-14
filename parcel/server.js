const Koa = require('koa')
const { resolve } = require('path')
const static = require('koa-static') // 用于加载静态资源

const app = new Koa()

app.use(static(resolve(__dirname, './')))

app.listen(4466)
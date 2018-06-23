const mongoose = require('mongoose')
const db = 'mongodb://127.0.0.1:12345/douban-test'
const glob = require('glob') // glob库，用于匹配符合匹配规则的文件
const { resolve } = require('path')

mongoose.Promise = global.Promise

// 初始化所有数据库表
exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
  // 同步获取schema文件夹下的所有js文件（嵌套的js文件也拿得到）, require 逐个加载进来
}

// 创建管理员
exports.initAdmin = async () => {
  const User = mongoose.model('User')
  let user = await User.findOne({
    username: 'Scott'
  })

  if (!user) {
    const user = new User({
      username: 'Main',
      email: '375277023@qq.com',
      password: '123456'
    })

    await user.save()
  }
}

exports.connect = () => {
  let maxConnectTimes = 0

  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'production') { // 判断是否是生产环境
      mongoose.set('debug', true)
    }

    mongoose.connect(db)

    mongoose.connection.on('disconnected', () => { // 断开连接时
      maxConnectTimes++

      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Error('数据库挂了吧，快去修吧少年')
      }
    })

    mongoose.connection.on('error', err => {
      maxConnectTimes++

      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Error('数据库挂了吧，快去修吧少年')
      }
    })

    mongoose.connection.once('open', () => {
      // const Dog = mongoose.model('Dog', { name: String })
      // const doga = new Dog({ name: '阿尔法' })

      // doga.save().then(() => {
      //   console.log('wang')
      // })
      resolve()
      console.log('MongoDB Connected successfully!')
    })
  })
}
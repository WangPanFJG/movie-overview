const cp = require('child_process') // 子进程工具
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

;(async () => {
  const script = resolve(__dirname, '../crawler/trailer-list') // 拿到爬虫脚本
  const child = cp.fork(script, []) //返回子进程对象
  let invoked = false // 辨识符，标识爬虫有没有跑起来

  child.on('error', err => {
    if (invoked) return // 如果进程（爬虫）被调用过
    invoked = true
    console.log(err);
  })

  child.on('exit', code => { // 进程退出
    if (invoked) return

    invoked = false

    let err = code === 0 ? null : new Error('exit code' + code)
    console.log(err);
    
  })
  child.on('message', data => {
    let result = data.result

    console.log('result:', result);
    
    result.forEach(async item => {
      let movie = await Movie.findOne({
        doubanId: item.doubanId
      })

      // 把电影信息存到Movie表
      if (!movie) { // 如果不存在此条movie记录，就把它存起来
        movie = new Movie(item)
        await movie.save()
      }
    })
  })
})()
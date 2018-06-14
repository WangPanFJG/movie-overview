const cp = require('child_process') // node的子线程模块，不用安装
const { resolve } = require('path')

;(async () => {
  const script = resolve(__dirname, '../crawler/video')
  const child = cp.fork(script, []) // 生成子线程
  let invoked = false

  child.on('error', err => {
    if (invoked) return

    invoked = true

    console.log(err)
  })

  child.on('exit', code => {
    if (invoked) return

    invoked = true
    let err = code === 0 ? null : new Error('exit code ' + code)

    console.log(err)
  })

  child.on('message', data => {
    console.log(data) // 拿到./crawler/video的process.send(data)
  })
})()
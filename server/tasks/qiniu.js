const qiniu = require('qiniu')
const nanoid = require('nanoid') // 生成随机的id作为静态资源的文件名
const config = require('../config')

const bucket = config.qiniu.bucket // config里配置的七牛的存储空间名
const mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK)
const cfg = new qiniu.conf.Config() // qiniu 的config对象
const client = new qiniu.rs.BucketManager(mac, cfg)

const uploadToQiniu = async (url, key) => {
  return new Promise((resolve, reject) => {
    client.fetch(url, bucket, key, (err, ret, info) => { // fetch方法能从网络上获取静态资源
      if (err) {
        reject(err)
      } else {
        if (info.statusCode === 200) {
          resolve({ key })
        } else {
          reject(info)
        }
      }
    })
  })
}


;(async () => {
  let movies = [{
    video: 'http://vt1.doubanio.com/201712282244/a97c1e7cd9025478b43ebc222bab892e/view/movie/M/302190491.mp4',
    doubanId: '26739551',
    poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2506258944.jpg',
    cover: 'https://img1.doubanio.com/img/trailer/medium/2493603388.jpg?'
  }]

  movies.map(async movie => {
    if (movie.video && !movie.key) { // 如果movie上有video链接，并且没有key（即： 尚未存到七牛）
      try {
        console.log('开始传 video')
        let videoData = await uploadToQiniu(movie.video, nanoid() + '.mp4')
        console.log('开始传 cover')
        let coverData = await uploadToQiniu(movie.cover, nanoid() + '.png')
        console.log('开始传 poster')
        let posterData = await uploadToQiniu(movie.poster, nanoid() + '.png')


        if (videoData.key) { // videoData上有key说明上传成功
          movie.videoKey = videoData.key
        }
        if (coverData.key) {
          movie.coverKey = coverData.key
        }
        if (posterData.key) {
          movie.posterKey = posterData.key
        }

        console.log(movie)
        // {
        //   video: 'http://vt1.doubanio.com/201712282244/a97c1e7cd9025478b43ebc222bab892e/view/movie/M/302190491.mp4',
        //   doubanId: '26739551',
        //   poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2506258944.jpg',
        //   cover: 'https://img1.doubanio.com/img/trailer/medium/2493603388.jpg?',
        //   videoKey: 'http://pacopvi05.bkt.clouddn.com/f_Cm_BJ9eBOtM9PROAF58.mp4',
        //   coverKey: 'http://pacopvi05.bkt.clouddn.com/ESImFeEEiW3RpCCsAnr3z.png',
        //   posterKey: 'http://pacopvi05.bkt.clouddn.com/uAzWzcRNDCsDi16UuEWp4.png'
        // }
      } catch (err) {
        console.log(err)
      }
    }
  })
})()

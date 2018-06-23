// 本页用于爬取详情页的movie地址
const puppeteer = require('puppeteer')

const base = `https://movie.douban.com/subject/`
// const doubanId = '26739551'
// const videoBase = `https://movie.douban.com/trailer/219491`

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

process.on('message', async movies => { // 接收tasks/tralier.js child.send(movies)
  console.log('Start visit the target page')

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false
  })

  const page = await browser.newPage()

  for (let i = 0; i < movies.length; i++) {
    let doubanId = movies[i].doubanId

    await page.goto(base + doubanId, {
      waitUntil: 'networkidle2'
    })
  
    await sleep(1000)
  
    const result = await page.evaluate(() => {
      var $ = window.$
      var it = $('.related-pic-video')
      if (it && it.length > 0) {
        var link = it.attr('href') // 预告片跳转地址
        // var cover = it.find('img').attr('src') // 封面图
        // let reg = /url\("([^"]+)"\)/
        let reg = /[^"]+(?="\))/
        let bg = it.css('backgroundImage')
        var cover = bg ? reg.exec(bg)[0] : '' // 封面图
  
        return {
          link,
          cover
        }
      }
  
      return {}
    })
  
    console.log('result', result);
    
    let video
  
    if (result.link) {
      // 如果有预告片跳转地址
      await page.goto(result.link, {
        waitUntil: 'networkidle2'
      })
      await sleep(2000)
  
      video = await page.evaluate(() => {
        var $ = window.$
        var it = $('source') // 预告片跳转地址页的video标签里的source
  
        if (it && it.length > 0) {
          return it.attr('src') // 拿到source上的真正视频地址
        }
  
        return ''
      })
    }
  
    const data = {
      video,
      doubanId,
      cover: result.cover
    }
  
    process.send(data)
  }
  browser.close()
  process.exit(0)
})
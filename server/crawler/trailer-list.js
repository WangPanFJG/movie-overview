const url = `https://movie.douban.com/tag/#/?sort=R&range=6,10&tags=` // 豆瓣电影页面的url

const puppeteer = require('puppeteer')
// 利用poppeteer无头浏览器进行爬虫

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})
console.log('进来了');

(async () => {
  console.log('Start visit the target page');
  const brower = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false
  })
  
  const page = await brower.newPage()
  await page.goto(url, {
    waitUntil: 'networkidle2'
  })
  await sleep(3000) // 等待.. 因为要等页面（url）加载完毕

  await page.waitForSelector('.more') // 等待豆瓣页面的加载更多按钮出现再继续，因为豆瓣的电影数据是分页的，点击加载更多才会加载下一页
  const need_page_max = 1 // 爬取的页数，设为1表示只爬取到第1页，（爬取0 1 页）
  for (let i = 0; i < need_page_max; i++) {
    await sleep(3000)
    await page.click('.more') // 调用加载更多按钮的click
  }

  const result = await page.evaluate(() => { // page.evaluate获取页面内容
    var $ = window.$ // 因为豆瓣的电影页有引用jQuery，所以可以直接用jQuery库
    let items = $('.list-wp a')
    var links = []
    
    if (items.length) {
      items.each((index, item) => {
        let it = $(item)
        let doubanId = it.find('div').data('id')
        let title = it.find('.title').text()
        let rate = Number(it.find('.rate').text())
        let poster = it.find('img').attr('src').replace('s_ratio', 'l_ratio') // 拿到图片地址，换成高清图
        links.push({
          doubanId,
          title,
          rate,
          poster
        })
      })

    }
    return links
  })
  brower.close()

  process.send({result})
  process.exit(0)
})()

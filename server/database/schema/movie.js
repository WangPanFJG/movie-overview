// 创建电影表
const mongoose = require('mongoose')
const Schema = mongoose.Schema // mongoose的建模工具
const { ObjectId, Mixed } = Schema.Types // Mixed一种特殊的数据类型，可以存储任意类型的数据

const movieSchema = new Schema({
  doubanId: {
    unique: true,
    type: String
  },

  category: [{
    type: ObjectId,
    ref: 'Category' // 该字段指向Category表
  }],

  rate: Number,
  title: String,
  summary: String,
  video: String,
  poster: String,
  cover: String,

  videoKey: String,
  posterKey: String,
  coverKey: String,

  rawTitle: String,
  movieTypes: [String], // 字符串数组
  pubdate: Mixed,
  year: Number,

  tags: [String],

  meta: {
    createdAt: { // 数据被创建的时间
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

movieSchema.pre('save', function (next) { // pre save 数据保存前
  if (this.isNew) { // 判断数据是否是新的
    this.meta.createdAt = this.meta.updatedAt = Date.now() // 如果是新的，把创建时间和更新时间都设为当前时间
  } else {
    this.meta.updatedAt = Date.now() // 如果不是新的，只把更新时间设为当前时间
  }

  next()
})

mongoose.model('Movie', movieSchema) // 创建模型（数据库）
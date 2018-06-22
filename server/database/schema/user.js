// 创建user表
const mongoose = require('mongoose')
const bcrypt = require('bcrypt') // bcrypt在新的node版本已内置，无需安装，如果是比较老的node版本，可以用另外的bcryptjs替代bcrypt
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed
const SALT_WORK_FACTOR = 10 // 
const MAX_LOGIN_ATTEMPTS = 5 // 最大登陆失败次数
const LOCK_TIME = 2 * 60 * 60 * 1000 // 超过最大登陆次数的登录锁定时间

const userSchema = new Schema({
  username: {
    unique: true, // 是否唯一
    required: true, // 是否必须
    type: String,
  },
  email: {
    unique: true,
    required: true,
    type: String,
  },
  password: {
    unique: true,
    type: String,
  },
  loginAttempts: { // 记录用户尝试登陆的次数
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number, // 登录锁定的到期时间
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// 设置虚拟字段（不会被存到数据库）， 设置isLocked虚拟字段来设置用户登录锁定
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
  // 设置isLocked字段的值为boolean， lockUntil存在并且lockUntil大于当前的时间
})

userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

// 密码加密： bcrypt加密工具
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()  
  // user表在更新前，检测密码是否有改动，isModified（mongoose内置的检测方法）

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => { // bcrypt加密工具密码加密
    // SALT_WORK_FACTOR是加盐的盐值， 值越大加密程度越大，
    if (err) return next(err) // 如果出错直接跳出

    bcrypt.hash(this.password, salt, (error, hash) => { // 如果没出错，就加密
      if (error) return next(error)
      // this指向当前表
      this.password = hash // 把当前表的password设为加密后的值hash
      next()
    })
  })
})

userSchema.methods = { // methods是实例方法，具备修改数据库的能力
  // 密码比较, _password 当前网站提交的明文密码（表单用户输入的密码）, password 数据库存储的加密密码
  comparePassword: (_password, password) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, (err, isMatch) => { // 使用bcrypt加密工具的compare方法比较
        if (!err) resolve(isMatch) // 比较出错时
        else reject(err)
      })
    })
  },

  // 检测用户的登陆次数是否超过限制
  incLoginAttepts: (user) => {
    return new Promise((resolve, reject) => {

      // 已锁定，并且锁定时间
      if (this.lockUntil && this.lockUntil < Date.now()) { // 判断lockUntil, 锁定到期时间是否超过当前时间
        this.update({
          $set: {
            loginAttempts: 1 // 把登陆次数设为1（这次也算，所以1）
          },
          $unset: {
            lockUntil: 1 // 设置过期时间为一毫秒，肯定小于
          }
        }, (err) => {
          if (!err) resolve(true)
          else reject(err)
        })
      } else { // 未锁定
        let updates = {
          $inc: {
            loginAttempts: 1
          }
        }

        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
          // 如果当前的登陆次数大于等于最大限制次数，并且并未被锁定
          updates.$set = {
            lockUntil: Date.now() + LOCK_TIME
          }
        }

        this.update(updates, err => {
          if (!err) resolve(true)
          else reject(err)
        })
      }
    })
  }
}

mongoose.model('User', userSchema)
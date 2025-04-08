const express = require('express')
const router = express.Router()
const userAuth = require('../../middlewares/user-auth')

// / 主页路由
router.use('/', require('./home'))

// /categories 分类路由
router.use('/categories', require('./categories'))

// /courses 获取课程列表
router.use('/courses', require('./courses'))

// /chapters 章节
router.use('/chapters', userAuth, require('./chapters'))

// /articles 文章
router.use('/articles', require('./articles'))

// /settings 设置
router.use('/settings', require('./settings'))

// /search 搜索
router.use('/search', require('./search'))

// /auth 登录
router.use('/auth', require('./auth'))

// /user 用户
router.use('/users', userAuth, require('./user'))

// /likes 点赞
router.use('/likes', userAuth, require('./likes'))

// /memberships 会员
router.use('/memberships', require('./memberships'))

// /orders 订单
router.use('/orders', userAuth, require('./order'))

module.exports = router

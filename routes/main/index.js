const express = require('express')
const router = express.Router()

// / 主页路由
router.use('/', require('./home'))

// /categories 分类路由
router.use('/categories', require('./categories'))

// /courses 获取课程列表
router.use('/courses', require('./courses'))

// /chapters 章节
router.use('/chapters', require('./chapters'))

// /articles 文章
router.use('/articles', require('./articles'))

// /settings 设置
router.use('/settings', require('./settings'))

// /search 搜索
router.use('/search', require('./search'))

// /auth 登录
router.use('/auth', require('./auth'))

module.exports = router

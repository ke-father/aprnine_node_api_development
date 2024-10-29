const express = require('express')
const router = express.Router()

// / 主页路由
router.use('/', require('./home'))

// /categories 分类路由
router.use('/categories', require('./categories'))

// /courses 获取课程列表
router.use('/courses', require('./courses'))

module.exports = router

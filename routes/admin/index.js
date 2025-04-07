const express = require('express')
const router = express.Router()
const adminAuth = require('../../middlewares/admin-auth')

// /admin/articles 文章
router.use('/articles', adminAuth, require('./articles'))

// /admin/categories 分类
router.use('/categories', adminAuth, require('./categories'))

// /admin/settings 设置
router.use('/settings', adminAuth, require('./settings'))

// /admin/users 用户
router.use('/users', adminAuth, require('./users'))

// /admin/courses 课程
router.use('/courses', adminAuth, require('./courses'))

// /admin/chapters 章节
router.use('/chapters', adminAuth, require('./chapters'))

// /admin/charts 统计
router.use('/charts', adminAuth, require('./charts'))

// /admin/auth 登录
router.use('/auth', require('./auth'))

// /admin/attachments 附件
router.use('/attachments', adminAuth, require('./attachments'))

// 日志
router.use('/logs', adminAuth, require('./logs'))

module.exports = router

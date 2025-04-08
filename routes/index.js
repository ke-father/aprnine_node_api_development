const express = require('express')
const router = express.Router()
const userAuth = require('../middlewares/user-auth')
const uploadMiddleware = require('../middlewares/uploadMiddleware')
const validateCaptCha = require('../middlewares/validate-captcha')
const multer = require('multer')
const upload = multer()

// 前台接口
router.use('/', require('./main'))
// 后台接口
router.use('/admin', require('./admin'))
// 上传接口
router.use('/uploads', userAuth, require('./uploads.js'))
// 验证码接口
router.use('/captcha', require('./captcha.js'))
// 订单接口
// router.use('/', require('./order'))

module.exports = router

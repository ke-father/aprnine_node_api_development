const express = require('express')
const router = express.Router()
const userAuth = require('../middlewares/user-auth')
const uploadMiddleware = require('../middlewares/uploadMiddleware')
const multer = require('multer')
const upload = multer()

// 前台接口
router.use('/', require('./main'))
// 后台接口
router.use('/admin', require('./admin'))
// 上传接口
router.use('/uploads', userAuth, require('./uploads.js'))

module.exports = router

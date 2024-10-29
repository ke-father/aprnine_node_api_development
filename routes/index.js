const express = require('express')
const router = express.Router()

// 前台接口
router.use('/', require('./main'))
// 后台接口
router.use('/admin', require('./admin'))

module.exports = router

const express = require('express')
const router = express.Router()
const userAuth = require('../../middlewares/user-auth')

router.use('/order', require('./order'))

module.exports = router

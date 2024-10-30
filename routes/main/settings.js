const express = require('express')
const router = express.Router()
const { Setting } = require('../../models')
const { failureResponse, successResponse, NotFoundError } = require('../../utils')

router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findOne()

        if (!settings) throw new NotFoundError('系统设置未找到')

        successResponse(res, '获取系统设置成功', {settings})
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

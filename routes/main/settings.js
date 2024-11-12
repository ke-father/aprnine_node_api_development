const express = require('express')
const router = express.Router()
const { Setting } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')
const createHttpError = require("http-errors");

router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findOne()

        if (!settings) throw new  createHttpError.NotFound('系统设置未找到')

        successResponse(res, '获取系统设置成功', {settings})
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

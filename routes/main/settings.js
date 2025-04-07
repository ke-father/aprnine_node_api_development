const express = require('express')
const router = express.Router()
const { Setting } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')
const createHttpError = require("http-errors");
const { getKey, setKey, flushAll} = require('../../utils/redis')

const SETTING_KEY = 'SETTINGS_KEY'

router.get('/', async (req, res) => {
    try {
        let settings = await getKey(SETTING_KEY)

        if (!settings) settings = await Setting.findOne()

        if (!settings) throw new  createHttpError.NotFound('系统设置未找到')

        await setKey(SETTING_KEY, settings)

        successResponse(res, '获取系统设置成功', {settings})
    } catch (e) {
        failureResponse(res, e)
    }
})

router.get('/flush-all', async (req, res) => {
    try {
        await flushAll()
        successResponse(res, '清除所有缓存成功')
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

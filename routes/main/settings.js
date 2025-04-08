const express = require('express')
const router = express.Router()
const { Setting } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')
const createHttpError = require("http-errors");
const { getKey, setKey} = require('../../utils/redis')

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

module.exports = router

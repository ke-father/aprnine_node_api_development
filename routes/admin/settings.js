const express = require('express');
const router = express.Router();
// 引入模型
const { Setting } = require('../../models')
const { successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");
const {getKey, setKey, delKey, flushAll} = require("../../utils/redis");

// 定义redis的key
const SETTING_KEY = 'SETTING_KEY'

// 更新系统设置
router.put('/', async (req, res) => {
    try {
        // 获取系统设置
        const setting = await getSetting()

        // 更新系统设置
        await setting.update(filterBody(req.body))
        // 清除redis缓存内容
        await delKey(SETTING_KEY)

        successResponse(res, '更新成功', setting)
    } catch (e) {
        failureResponse(res, e, '更新系统设置失败')
    }
})

// 查询系统设置详情
router.get('/', async (req, res) => {
    try {
        // 获取系统设置
        const setting = await getSetting()

        await setKey(SETTING_KEY, setting)

        successResponse(res, '查询成功', setting)
    } catch (e) {
        failureResponse(res, e, '查询系统设置详情失败')
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

// 公共方法：查询当前系统设置
const getSetting = async () => {
    // 读取缓存中的数据
    let setting = await getKey(SETTING_KEY)

    if (!setting) {
        setting = await Setting.findOne()
    }

    // 系统设置未找到 抛出错误
    if (!setting) throw new  createHttpError.NotFound(`初始系统设置未找到，请运行种子文件。`)

    return setting

}

// 公共方法：白名单过滤
const filterBody = (body) => {
    const whiteList = ['name', 'icp', 'copyright']

    let returnBody = {}
    for (const key in body) {
        if (whiteList.includes(key)) {
            returnBody[key] = body[key]
        }
    }

    return returnBody
}

module.exports = router

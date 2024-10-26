const express = require('express');
const router = express.Router();
// 引入模型
const { Setting } = require('../../models')
const { NotFoundError, successResponse, failureResponse} = require('../../utils')

// 更新系统设置
router.put('/', async (req, res) => {
    try {
        // 获取系统设置
        const setting = await getSetting()

        // 更新系统设置
        await setting.update(filterBody(req.body))

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

        successResponse(res, '查询成功', setting)
    } catch (e) {
        failureResponse(res, e, '查询系统设置详情失败')
    }
})

// 公共方法：查询当前系统设置
const getSetting = async () => {
    // 向数据库查询
    const setting = await Setting.findOne()

    // 系统设置未找到 抛出错误
    if (!setting) throw new NotFoundError(`初始系统设置未找到，请运行种子文件。`)

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

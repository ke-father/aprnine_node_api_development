const express = require('express');
const router = express.Router();
// 引入模型
const { Log } = require('../../models')
const { successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");

// 查询日志列表
router.get('/', async (req, res) => {
    try {
        const logs = await Log.findAll({
            order: [['id', 'DESC']],
        })

        successResponse(res, '查询日志列表成功', { logs })
    } catch (e) {
        failureResponse(res, e)
    }
})

// 查询日志详情
router.get('/:id', async (req, res) => {
    try {
        const log = await getLog(req)

        successResponse(res, '查询日志成功', { log })
    } catch (e) {
        failureResponse(res, e)
    }
})

// 清空全部日志
router.delete('/clean', async (req, res) => {
    try {
        // 截断表， 每次删除后  id都会从1重新开始
        await Log.destroy({ truncate: true })

        successResponse(res, '清空日志成功')
    } catch (e) {
        failureResponse(res, e)
    }
})

// 删除日志
router.delete('/:id', async (req, res) => {
    try {
        const log = await getLog(req)
        await log.destroy()

        successResponse(res, '删除日志成功')
    } catch (e) {
        failureResponse(res, e)
    }
})

// 公共方法：查询当前日志
const getLog = async (req) => {
    const { id } = req.params
    if (!id) throw new createHttpError.BadRequest('缺少必要参数')

    const log = await Log.findByPk(id)
    if (!log) throw new createHttpError.NotFound(`ID: ${id} 的日志未找到`)

    return log
}

module.exports = router

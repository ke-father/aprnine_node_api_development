const express = require('express');
const router = express.Router();
const { sequelize, User } = require('../../models');
const { Op } = require("sequelize");
const {
    successResponse,
    failureResponse
} = require('../../utils')

// 统计用户性别
router.get(`/sex`, async (req, res) => {
    try {
        const male = await User.count({ where: { sex: 0 } })
        const female = await User.count({ where: { sex: 1 } })
        const unknown = await User.count({ where: { sex: 2 } })

        const data = [
            { value: male, name: '男' },
            { value: female, name: '女' },
            { value: unknown, name: '未知' },
        ]

        successResponse(res, '查询用户性别成功', { data })
    } catch (error) {
        failureResponse(res, error)
    }
})

// 统计月注册用户数量
router.get(`/user`, async (req, res) => {
    try {
        // TODO 返回一个数组
        const [results] = await sequelize.query(`SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS value FROM Users GROUP BY month ORDER BY month`)

        const data = {
            months: results.map(i => i.month),
            values: results.map(i => i.value)
        }

        successResponse(res, '查询每月用户数量成功', {})
    } catch (error) {
        failureResponse(res, error)
    }
})


module.exports = router

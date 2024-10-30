const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Course } = require('../../models')
const { NotFoundError, successResponse, failureResponse } = require('../../utils')

// 搜索课程
router.get('/', async (req, res) => {
    try {
        const query = req.query
        const pages = {
            // 当前页
            currentPage: Math.abs(Number(query.currentPage)) || 1,
            // 页面显示数据条数
            pageSize: Math.abs(Number(query.pageSize)) || 10
        }

        // 计算偏移量
        const offset = (pages.currentPage - 1) * pages.pageSize

        const condition = {
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            order: [['id', 'desc']],
            limit: pages.pageSize,
            offset
        }

        query?.name && (condition.where = { name: { [Op.like]: `%${query.name}%` } })

        const { count, rows } = await Course.findAndCountAll(condition)
        successResponse(res, '查询课程列表成功', {
            courses: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

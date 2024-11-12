const express = require('express')
const router = express.Router()
const { Course, Category, Chapter, User } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')
const createHttpError = require("http-errors");

// 获取课程列表
router.get('/', async (req, res) => {
    try {
        // 获取请求参数
        const query = req.query
        // 获取分页参数 当前页
        const pages = {
            // 当前页
            currentPage: Math.abs(Number(query.currentPage))|| 1,
            // 页面显示数据条数
            pageSize: Math.abs(Number(query.pageSize)) || 10
        }

        // 计算偏移量
        const offset = (pages.currentPage - 1) * pages.pageSize

        // 判断是否传入分类Id
        if (!query.categoryId) throw new createHttpError.BadRequest('获取课程列表失败，分类ID不能为空')

        // 定义查询条件
        const condition = {
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            where: { categoryId: query.categoryId },
            // 排序
            order: [['id', 'desc']],
            // 查询查询条数 pageSize
            limit: pages.pageSize,
            // 偏移量
            offset
        }

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

// 获取课程详情
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const condition = {
            attributes: { exclude: ['CategoryId', 'UserId'] },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Chapter,
                    as: 'chapters',
                    attributes: ['id', 'title', 'rank', 'createdAt'],
                    order: [['rank', 'asc'], ['id', 'desc']]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'nickname', 'avatar', 'company']
                }
            ]
        }

        const course = await Course.findByPk(id, condition)

        if (!course) throw new  createHttpError.NotFound(`id为${id}的课程未找到`)

        successResponse(res, '查询课程成功', { course })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

const express = require('express')
const router = express.Router()
const { Article } = require('../../models')
const { successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");
const { getKey, setKey } = require('../../utils/redis')

// 获取文章列表
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

        const ARTICLES_KEY = `ARTICLES_KEY:${pages.currentPage}:${pages.pageSize}`
        let data = await getKey(ARTICLES_KEY)
        if (data) return successResponse(res, '查询文章列表成功', data)

        const condition = {
            attributes: { exclude: ['content'] },
            order: [['id', 'desc']],
            limit: pages.pageSize,
            offset
        }

        const { count, rows } = await Article.findAndCountAll(condition)
        data = {
            articles: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        }
        await setKey(ARTICLES_KEY, data)
        successResponse(res, '查询文章列表成功', data)
    } catch (e) {
        failureResponse(res, e)
    }
})

// 获取文章详情
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        let article = await getKey(`ARTICLE:${id}`)
        if (!article) article = await Article.findByPk(id)

        if (!article) throw new  createHttpError.NotFound(`ID: ${id} 的文章未找到`)

        successResponse(res, '查询成功', {article})
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

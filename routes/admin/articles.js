const express = require('express');
const router = express.Router();
// 引入模型
const {Article} = require('../../models')
const {Op} = require('sequelize')
const {successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");
const {getKeysByPattern, delKey} = require("../../utils/redis");

// 查询文章列表
router.get('/', async (req, res) => {
    try {
        // 获取查询参数
        const query = req.query

        // 获取分页参数 当前页
        const pages = {
            // 当前页
            currentPage: Math.abs(Number(query.currentPage)) || 1,
            // 页面显示数据条数
            pageSize: Math.abs(Number(query.pageSize)) || 10
        }

        // 计算偏移量
        const offset = (pages.currentPage - 1) * pages.pageSize

        // 定义查询条件
        const condition = {
            // 排序
            order: [['id', 'DESC']],
            // 查询查询条数 pageSize
            limit: pages.pageSize,
            // 偏移量
            offset
        }

        const queryType = {
            title: () => ({[Op.like]: `%${query.title}%`}),
            deleted: () => ({[Op.not]: null})
        }

        Object.keys(query).map(key => {
            if (key in queryType) {
                if (!('where' in condition)) condition.where = {}
                if (key === 'deleted' && query[key] === 'true') {
                    condition.paranoid = false
                    condition.where.deletedAt = queryType[key]()
                } else condition.where[key] = queryType[key]()

            }
        })

        // 获取数据库内容
        const {count, rows} = await Article.findAndCountAll(condition)

        successResponse(res, '查询成功', {
            articles: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        })
    } catch (e) {
        failureResponse(res, e, '查询文章列表失败')
    }
})

// 创建文章
router.post('/', async (req, res) => {
    try {
        // 创建文章
        const article = await Article.create(filterBody(req.body))
        await clearCache()
        successResponse(res, '创建成功', article, 201)
    } catch (e) {
        failureResponse(res, e, '创建文章失败')
    }
})

// 删除文章
router.post('/force_delete', async (req, res) => {
    try {
        const {id} = req.body

        // id可以是单个 也可以是数组
        await Article.destroy({
            where: {id},
            force: true
        })
        await clearCache(id)
        successResponse(res, '删除成功')
    } catch (e) {
        failureResponse(res, e, '删除文章失败')
    }
})

// 删除文章到回收站
router.post('/delete', async (req, res) => {
    try {
        const {id} = req.body

        // id可以是单个 也可以是数组
        await Article.destroy({where: {id}})
        await clearCache(id)
        successResponse(res, '删除成功')
    } catch (e) {
        failureResponse(res, e, '删除文章失败')
    }
})

// 恢复文章
router.post('/restore', async (req, res) => {
    try {
        const {id} = req.body

        // id可以是单个 也可以是数组
        await Article.restore({where: {id}})
        await clearCache(id)
        successResponse(res, '恢复成功')
    } catch (e) {
        failureResponse(res, e, '恢复文章失败')
    }
})

// 更新文章
router.put('/:id', async (req, res) => {
    try {
        // 获取文章
        const article = await getArticle(req)

        // 更新文章
        await article.update(filterBody(req.body))
        await clearCache(article.id)
        successResponse(res, '更新成功', article)
    } catch (e) {
        failureResponse(res, e, '更新文章失败')
    }
})

// 查询文章详情
router.get('/:id', async (req, res) => {
    try {
        // 获取文章
        const article = await getArticle(req)

        successResponse(res, '查询成功', article)
    } catch (e) {
        failureResponse(res, e, '查询文章详情失败')
    }
})

// 清除缓存
const clearCache = async (id = null) => {
    // 清除所有文章列表缓存
    const keys = await getKeysByPattern('ARTICLES_KEY:*')

    if (keys?.length !== 0) await delKey(keys)

    if (id) {
        let delIdKeys = Array.isArray(id)
            ? id.map(item => `ARTICLES_KEY:${item}`)
            : `ARTICLES_KEY:${id}`
        await delKey(delIdKeys)
    }
}

// 公共方法：查询当前文章
const getArticle = async (req) => {
    // 获取文章id
    const {id} = req.params

    // 向数据库查询
    const article = await Article.findByPk(id)

    // 文章未找到 抛出错误
    if (!article) throw new createHttpError.NotFound(`ID: ${id} 的文章未找到`)

    return article

}

// 公共方法：白名单过滤
const filterBody = (body) => {
    const whiteList = ['title', 'content']

    let returnBody = {}
    for (const key in body) {
        if (whiteList.includes(key)) {
            returnBody[key] = body[key]
        }
    }

    return returnBody
}

module.exports = router

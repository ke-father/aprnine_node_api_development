const express = require('express');
const router = express.Router();
// 引入模型
const { Category, Course } = require('../../models')
const { Op } = require('sequelize')
const { successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");

// 查询分类列表
router.get('/', async (req, res) => {
    try {
        // 获取查询参数
        const query = req.query

        // 定义查询条件
        const condition = {
            // 排序
            order: [['rank', 'ASC'], ['id', 'ASC']]
        }

        const queryType = {
            name: () => ({ [Op.like]: `%${query.name}%` })
        }

        Object.keys(query).map(key => {
            if (key in queryType) {
                if (!('where' in condition)) condition.where = {}
                condition.where[key] = queryType[key]()
            }
        })

        // 获取数据库内容
        const data = await Category.findAll(condition)

        successResponse(res, '查询成功', data)
    } catch (e) {
        failureResponse(res, e, '查询分类列表失败')
    }
})

// 创建分类
router.post('/', async (req, res) => {
    try {
        // 创建分类
        const category = await Category.create(filterBody(req.body))

        successResponse(res, '创建成功', category, 201)
    } catch (e) {
        failureResponse(res, e, '创建分类失败')
    }
})

// 删除分类
router.delete('/:id', async (req, res) => {
    try {
        // 获取分类
        const category = await getCategory(req)

        // 获取分类下的课程 如果存在课程则无法删除
        const count = await Course.count({ where: { categoryId: req.params.id } })
        if (count > 0) throw new createHttpError.Conflict('该分类下有课程，无法删除')
        // if (count > 0) throw new Error('该分类下有课程，无法删除')

        // 删除分类
        // await Category.destroy({
        //     where: { id }
        // })
        await category.destroy()

        successResponse(res, '删除成功')
    } catch (e) {
        failureResponse(res, e)
    }
})

// 更新分类
router.put('/:id', async (req, res) => {
    try {
        // 获取分类
        const category = await getCategory(req)

        // 更新分类
        await category.update(filterBody(req.body))

        successResponse(res, '更新成功', category)
    } catch (e) {
        failureResponse(res, e, '更新分类失败')
    }
})

// 查询分类详情
router.get('/:id', async (req, res) => {
    try {
        // 获取分类
        const category = await getCategory(req)

        successResponse(res, '查询成功', category)
    } catch (e) {
        failureResponse(res, e, '查询分类详情失败')
    }
})

// 公共方法：查询当前分类
const getCategory = async (req) => {
    // 获取分类id
    const { id } = req.params

    // 向数据库查询
    const category = await Category.findByPk(id)

    // 分类未找到 抛出错误
    if (!category) throw new  createHttpError.NotFound(`ID: ${id} 的分类未找到`)

    return category

}

// 公共方法：白名单过滤
const filterBody = (body) => {
    const whiteList = ['name', 'rank']

    let returnBody = {}
    for (const key in body) {
        if (whiteList.includes(key)) {
            returnBody[key] = body[key]
        }
    }

    return returnBody
}

module.exports = router

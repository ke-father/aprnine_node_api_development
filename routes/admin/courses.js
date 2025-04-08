const express = require('express');
const router = express.Router();
// 引入模型
const { Course, Category, User, Chapter } = require('../../models')
const { Op } = require('sequelize')
const { successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");

// 查询课程列表
router.get('/', async (req, res) => {
    try {
        // 获取查询参数
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

        // 定义查询条件
        const condition = {
            ...getCondition(),
            // 排序
            order: [['id', 'DESC']],
            // 查询查询条数 pageSize
            limit: pages.pageSize,
            // 偏移量
            offset
        }

        const queryType = {
            // Op.eq 为相等 精确查找
            categoryId: () => ({ [Op.eq]: query.categoryId }),
            userId: () => ({ [Op.eq]: query.userId }),
            // Op.like 为模糊查找
            name: () => ({ [Op.like]: `%${query.name}%` }),
            recommended: () => ({ [Op.eq]: query.recommended === 'true' }),
            introductory: () => ({ [Op.eq]: query.introductory === 'true' }),
        }

        Object.keys(query).map(key => {
            if (key in queryType) {
                if (!('where' in condition)) condition.where = {}
                condition.where[key] = queryType[key]()
            }
        })

        // 获取数据库内容
        const { count, rows } = await Course.findAndCountAll(condition)

        successResponse(res, '查询成功', {
            courses: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        })
    } catch (e) {
        failureResponse(res, e, '查询课程列表失败')
    }
})

// 创建课程
router.post('/', async (req, res) => {
    try {
        const body = filterBody(req.body)
        body.userId = req.user.id
        // 创建课程
        const course = await Course.create(body)

        await clearCache()
        successResponse(res, '创建成功', course, 201)
    } catch (e) {
        failureResponse(res, e, '创建课程失败')
    }
})

// 删除课程
router.delete('/:id', async (req, res) => {
    try {
        // 获取课程
        const course = await getCourse(req)

        // 获取分类下的课程 如果存在课程则无法删除
        const count = await Chapter.count({ where: { courseId: req.params.id } })
        if (count > 0) throw new createHttpError.Conflict('当前课程有章节，无法删除')

        // 删除课程
        // await Course.destroy({
        //     where: { id }
        // })
        await course.destroy()
        await clearCache(course)
        successResponse(res, '删除成功')
    } catch (e) {
        failureResponse(res, e, '删除课程失败')
    }
})

// 更新课程
router.put('/:id', async (req, res) => {
    try {
        // 获取课程
        const course = await getCourse(req)

        // 更新课程
        await course.update(filterBody(req.body))
        await clearCache(course)
        successResponse(res, '更新成功', course)
    } catch (e) {
        failureResponse(res, e, '更新课程失败')
    }
})

// 查询课程详情
router.get('/:id', async (req, res) => {
    try {
        // 获取课程
        const course = await getCourse(req)

        successResponse(res, '查询成功', course)
    } catch (e) {
        failureResponse(res, e, '查询课程详情失败')
    }
})

// 公共方法：关联查询定义
const getCondition = () => {
    return {
        // 排除字段
        attributes: { exclude: ['CategoryId', 'UserId'] },
        include: [
            {
                // 关联表
                model: Category,
                as: 'category',
                // 需要查询的属性
                attributes: ['id', 'name']
            },
            {
                // 关联表
                model: User,
                as: 'user',
                // 需要查询的属性
                attributes: ['id', 'userName', 'avatar']
            }
        ]
    }
}

// 公共方法：查询当前课程
const getCourse = async (req) => {
    // 获取课程id
    const { id } = req.params

    // 定义查询条件
    const condition = getCondition()

    // 向数据库查询
    const course = await Course.findByPk(id, condition)

    // 课程未找到 抛出错误
    if (!course) throw new  createHttpError.NotFound(`ID: ${id} 的课程未找到`)

    return course

}

// 公共方法：白名单过滤
const filterBody = (body) => {
    const whiteList = ['categoryId', 'name', 'image', 'recommended', 'introduction', 'content', 'free']

    let returnBody = {}
    for (const key in body) {
        if (whiteList.includes(key)) {
            returnBody[key] = body[key]
        }
    }

    return returnBody
}

const { getKeysByPattern, delKey } = require('../../utils/redis');

/**
 * 清除缓存
 * @param course
 * @returns {Promise<void>}
 */
async function clearCache(course = null) {
    let keys = await getKeysByPattern('courses:*');
    if (keys.length !== 0) {
        await delKey(keys);
    }

    if (course) {
        await delKey(`course:${course.id}`);
    }
}


module.exports = router

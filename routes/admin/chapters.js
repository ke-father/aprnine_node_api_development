const express = require('express');
const router = express.Router();
// 引入模型
const {Chapter, Course} = require('../../models')
const {Op} = require('sequelize')
const {successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");

// 查询章节列表
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
        if (!query.courseId) throw new createHttpError.BadRequest('获取章节列表失败，课程ID不能为空')

        // 定义查询条件
        const condition = {
            ...getCondition(),
            // 排序
            order: [['rank', 'ASC'], ['id', 'DESC']],
            // 查询查询条数 pageSize
            limit: pages.pageSize,
            // 偏移量
            offset
        }

        const queryType = {
            // Op.eq 为相等 精确查找
            title: () => ({[Op.like]: `%${query.title}%`}),
            courseId: () => ({[Op.eq]: query.courseId})
        }

        Object.keys(query).map(key => {
            if (key in queryType) {
                if (!('where' in condition)) condition.where = {}
                condition.where[key] = queryType[key]()
            }
        })

        // 获取数据库内容
        const {count, rows} = await Chapter.findAndCountAll(condition)

        successResponse(res, '查询成功', {
            chapters: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        })
    } catch (e) {
        failureResponse(res, e, '查询章节列表失败')
    }
})

// 创建章节
router.post('/', async (req, res) => {
    try {
        // 创建章节
        const chapter = await Chapter.create(filterBody(req.body))
        // 对应课程中 章节数量统计+1
        await Course.increment('chaptersCount', { where: { id: chapter.courseId } })
        await clearCache(chapter)
        successResponse(res, '创建成功', chapter, 201)
    } catch (e) {
        failureResponse(res, e, '创建章节失败')
    }
})

// 删除章节
router.delete('/:id', async (req, res) => {
    try {
        // 获取章节
        const chapter = await getChapter(req)

        // 删除章节
        // await Chapter.destroy({
        //     where: { id }
        // })
        await chapter.destroy()

        // 删除章节成功后，对应课程中 章节数量统计-1
        await Course.decrement('chaptersCount', { where: { id: chapter.courseId } })
        await clearCache(chapter)
        successResponse(res, '删除成功')
    } catch (e) {
        failureResponse(res, e, '删除章节失败')
    }
})

// 更新章节
router.put('/:id', async (req, res) => {
    try {
        // 获取章节
        const chapter = await getChapter(req)

        // 更新章节
        await chapter.update(filterBody(req.body))

        await clearCache(chapter)
        successResponse(res, '更新成功', chapter)
    } catch (e) {
        failureResponse(res, e, '更新章节失败')
    }
})

// 查询章节详情
router.get('/:id', async (req, res) => {
    try {
        // 获取章节
        const chapter = await getChapter(req)

        successResponse(res, '查询成功', chapter)
    } catch (e) {
        failureResponse(res, e, '查询章节详情失败')
    }
})

// 公共方法：关联查询定义
const getCondition = () => {
    return {
        // 排除字段
        attributes: {exclude: ['CourseId']},
        include: [
            {
                model: Course,
                as: 'course',
                attributes: ['id', 'name']
            }
        ]
    }
}

// 公共方法：查询当前章节
const getChapter = async (req) => {
    // 获取章节id
    const {id} = req.params

    // 定义查询条件
    const condition = getCondition()

    // 向数据库查询
    const chapter = await Chapter.findByPk(id, condition)

    // 章节未找到 抛出错误
    if (!chapter) throw new  createHttpError.NotFound(`ID: ${id} 的章节未找到`)

    return chapter

}

// 公共方法：白名单过滤
const filterBody = (body) => {
    const whiteList = ['courseId', 'title', 'content', 'video', 'rank']

    let returnBody = {}
    for (const key in body) {
        if (whiteList.includes(key)) {
            returnBody[key] = body[key]
        }
    }

    return returnBody
}

const { delKey } = require('../../utils/redis');

/**
 * 清除缓存
 * @param chapter
 * @returns {Promise<void>}
 */
async function clearCache(chapter) {
    await delKey(`chapters:${chapter.courseId}`);
    await delKey(`chapter:${chapter.id}`);
}


module.exports = router

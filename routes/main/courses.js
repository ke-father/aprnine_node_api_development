const express = require('express')
const router = express.Router()
const { Course, Category, Chapter, User } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')
const createHttpError = require("http-errors");
const {getKey, setKey} = require("../../utils/redis");

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

        const COURSES_KEY = `COURSES:${query.categoryId}:${pages.currentPage}:${pages.pageSize}`

        let data = await getKey(COURSES_KEY)
        if (data) return successResponse(res, '查询课程列表成功', data)

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
        data = {
            courses: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        }

        await setKey(COURSES_KEY, data)
        successResponse(res, '查询课程列表成功', data)
    } catch (e) {
        failureResponse(res, e)
    }
})

// 获取课程详情
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        // 查询课程
        let COURSE_KEY = `COURSE_KEY:${id}`
        let course = await getKey(COURSE_KEY)
        // 查询数据库
        if (!course) course = await Course.findByPk(id, {
            attributes: { exclude: ['CategoryId', 'UserId'] },
        })
        if (!course) throw new  createHttpError.NotFound(`id为${id}的课程未找到`)
        await setKey(COURSE_KEY, course)

        // 查询课程关联分类
        let CATEGORY_KEY = `CATEGORY_KEY:${course.categoryId}`
        let category = await getKey(CATEGORY_KEY)
        if (!category) category = await Category.findByPk(course.categoryId)
        await setKey(CATEGORY_KEY, category)

        // 查询课程关联用户
        let USER_KEY = `USER_KEY:${course.userId}`
        let user = await getKey(USER_KEY)
        if (!user) user = await User.findByPk(course.userId, {
            attributes: { exclude: ['password'] },
        })
        await setKey(USER_KEY, user)

        // 查询课程关联章节
        let CHAPTER_KEY = `CHAPTER_KEY:${course.id}`
        let chapters = await getKey(CHAPTER_KEY)
        if (!chapters) chapters = await Chapter.findAll({
            attributes: { exclude: ['CourseId', 'content'] },
            where: { courseId: course.id },
            order: [['rank', 'ASC'], ['id', 'DESC']]
        })
        await setKey(CHAPTER_KEY, chapters)


        successResponse(res, '查询课程成功', { course, category, user, chapters })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

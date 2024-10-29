const express = require('express')
const router = express.Router()
const { Course, Category, User } = require('../../models')
const { successResponse, failureResponse } = require('../../utils')
router.get('/', async (req, res, next) => {
    try {
        // 焦点图 推荐课程
        const recommendedCourses = await Course.findAll({
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'nickname', 'avatar', 'company']
                }
            ],
            where: { recommended: true },
            order: [['id', 'desc']],
            limit: 10
        })

        // 人气课程 点赞数量多的课程
        const likesCourses = await Course.findAll({
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            order: [['likesCount', 'desc'], ['id', 'desc']],
            limit: 10
        })

        // 入门课程
        const introductoryCourses = await Course.findAll({
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            where: { introductory: true },
            order: [['id', 'desc']],
            limit: 10
        })

        successResponse(res, '获取首页数据成功', {
            recommendedCourses,
            likesCourses,
            introductoryCourses
        })
    } catch (e) {
        failureResponse(res, e)
    }
})


module.exports = router

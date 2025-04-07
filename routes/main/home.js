const express = require('express')
const router = express.Router()
const { Course, Category, User } = require('../../models')
const { successResponse, failureResponse } = require('../../utils')
const {getKey, setKey} = require("../../utils/redis");

const HOME_INDEX_KEY = 'HOME_INDEX_KEY'
router.get('/', async (req, res, next) => {
    try {
        // 如果有缓存直接返回缓存数据
        let data = await getKey(HOME_INDEX_KEY)
        if (data) return successResponse(res, '获取首页数据成功', data)

        const [recommendedCourses, likesCourses, introductoryCourses] = await Promise.all([
            // 焦点图 推荐课程
            await Course.findAll({
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
            }),

            // 人气课程 点赞数量多的课程
            await Course.findAll({
                attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
                order: [['likesCount', 'desc'], ['id', 'desc']],
                limit: 10
            }),

            // 入门课程
            await Course.findAll({
                attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
                where: { introductory: true },
                order: [['id', 'desc']],
                limit: 10
            })
        ])

        data = {
            recommendedCourses,
            likesCourses,
            introductoryCourses
        }

        await setKey(HOME_INDEX_KEY, data, 30 * 60)

        successResponse(res, '获取首页数据成功', data)
    } catch (e) {
        failureResponse(res, e)
    }
})


module.exports = router

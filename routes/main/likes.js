const express = require('express')
const router = express.Router()
const { Like, Course, User } = require('../../models')
const { successResponse, failureResponse, NotFoundError } = require('../../utils')

// 点赞、取消点赞
router.post('/', async (req, res) => {
    try {
        const userId = req.userId
        const { courseId } = req.body

        // 查找课程
        const course = await Course.findByPk(courseId)
        if (!course) throw new NotFoundError('课程不存在')

        // 获取点赞
        const like = await Like.findOne({
            where: {
                courseId,
                userId
            }
        })

        // 如果记录没有代表未点过赞
        if (!like) {
            await Like.create({ courseId, userId })
            // 自增
            await course.increment('likesCount')
            successResponse(res, '点赞成功')
        } else {
            await like.destroy()
            // 自减
            await course.decrement('likesCount')
            successResponse(res, '取消点赞成功')
        }
    } catch (e) {
        failureResponse(res, e)
    }
})

/**
 * 查询用户点赞的课程
 * GET /likes
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const page = {
            // 当前页
            currentPage: Math.abs(Number(query.currentPage)) || 1,
            // 页面显示数据条数
            pageSize: Math.abs(Number(query.pageSize)) || 10
        }
        const offset = (page.currentPage - 1) * page.pageSize;

        // 查询当前用户
        const user = await User.findByPk(req.userId);

        // 查询当前用户点赞过的课程
        const courses = await user.getLikeCourses({
            joinTableAttributes: [],
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            order: [['id', 'DESC']],
            limit: page.pageSize,
            offset: offset
        });

        // 查询当前用户点赞过的课程总数
        const count = await user.countLikeCourses();

        successResponse(res, '查询用户点赞的课程成功。', {
            courses,
            pagination: {
                total: count,
                currentPage: page.currentPage,
                pageSize: page.pageSize,
            }
        })
    } catch (error) {
        failureResponse(res, error);
    }
});


module.exports = router

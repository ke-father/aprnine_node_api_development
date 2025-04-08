const express = require('express');
const router = express.Router();
const {Chapter, Course, User} = require('../../models')
const {successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");
const {getKey, setKey} = require("../../utils/redis");

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params

        // 查询章节
        let CHAPTER_KEY = `CHAPTER_KEY:${id}`
        let chapter = await getKey(CHAPTER_KEY)
        if (!chapter) chapter = await Chapter.findByPk(id, {
            attributes: { exclude: ['CourseId'] },
        })
        if (!chapter) throw new  createHttpError.NotFound(`id为${id}的章节未找到`)

        // 检查用户是否可以浏览当前章节
        await checkUserRole(req, chapter)
        console.warn(111)

        // 查询章节关联的课程
        let COURSE_KEY = `COURSE_KEY:${chapter.courseId}`
        let course = await getKey(COURSE_KEY)
        if (!course) course = await Course.findByPk(chapter.courseId, {
            attributes: { exclude: ['CategoryId', 'UserId'] },
        })
        await setKey(COURSE_KEY, course)

        let USER_KEY = `USER_KEY:${course.userId}`
        let user = await getKey(USER_KEY)
        if (!user) user = await User.findByPk(course.userId, {
            attributes: ['id', 'username', 'nickname', 'avatar', 'company']
        })
        await setKey(USER_KEY, user)

        // 查询同一课程下的其他章节
        let CHAPTERS_KEY = `CHAPTERS_KEY:${course.courseId}`
        let chapters = await getKey(CHAPTERS_KEY)
        if (!chapters) chapters = await Chapter.findAll({
            attributes: {exclude: ['CourseId', 'content']},
            where: {courseId: chapter.courseId},
            order: [['rank', 'asc'], ['id', 'desc']]
        })
        await setKey(CHAPTERS_KEY, chapters)

        successResponse(res, '查询所有章节成功', {
            // 章节
            chapter,
            course,
            user,
            // 课程目录下的所有章节
            chapters
        })
    } catch (e) {
        console.log(e)
        failureResponse(res, e)
    }
})

// 检查用户是否可以浏览当前章节
const checkUserRole = async (req, chapter) => {
    if (chapter.free) return

    // 检查用户是否有权限访问
    const allowedRoles = [1, 100]
    const user = await User.findByPk(req.userId)
    if (!allowedRoles.includes(user.role)) throw new createHttpError.Forbidden('您没有权限访问该章节')
}

module.exports = router

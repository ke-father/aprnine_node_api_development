const express = require('express');
const router = express.Router();
const {Chapter, Course, User} = require('../../models')
const {NotFoundError, successResponse, failureResponse} = require('../../utils')

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params

        // const condition = {
        //     attributes: {exclude: ['CourseId']},
        //     include: [
        //         {
        //             model: Course,
        //             as: 'course',
        //             attributes: ['id', 'name'],
        //             include: [
        //                 {
        //                     model: User,
        //                     as: 'user',
        //                     attributes: ['id', 'username', 'nickname', 'avatar', 'company']
        //                 }
        //             ]
        //         }
        //     ]
        // }

        // 查询当前章节
        const chapter = await Chapter.findByPk(id, {
            attributes: { exclude: ['CourseId'] },
        });

        if (!chapter) throw new NotFoundError(`id为${id}的章节未找到`)

        // 查询章节关联的课程
        const course = await chapter.getCourse({
            attributes: ['id', 'name', 'userId'],
        });

        const user = await course.getUser({
            attributes: ['id', 'username', 'nickname', 'avatar', 'company']
        })

        // 查询同一课程下的其他章节
        const chapters = await Chapter.findAll({
            attributes: {exclude: ['CourseId', 'content']},
            where: {courseId: chapter.courseId},
            order: [['rank', 'asc'], ['id', 'desc']]
        })

        successResponse(res, '查询所有章节成功', {
            // 章节
            chapter,
            course,
            user,
            // 课程目录下的所有章节
            chapters
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

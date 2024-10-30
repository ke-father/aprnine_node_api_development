const express = require('express');
const router = express.Router();
const {Chapter, Course, User} = require('../../models')
const {NotFoundError, successResponse, failureResponse} = require('../../utils')

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params

        const condition = {
            attributes: {exclude: ['CourseId']},
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'nickname', 'avatar', 'company']
                        }
                    ]
                }
            ]
        }

        const chapter = await Chapter.findByPk(id, condition)
        if (!chapter) throw new NotFoundError(`id为${id}的章节未找到`)

        // 查询同一课程下的其他章节
        const chapters = await Chapter.findAll({
            attributes: {exclude: ['CourseId', 'content']},
            where: {courseId: chapter.courseId},
            order: [['rank', 'asc'], ['id', 'desc']]
        })

        successResponse(res, '查询所有章节成功', {
            chapter,
            chapters
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

const express = require('express')
const router = express.Router()
const { Attachment, User } = require('../../models')
const createHttpError = require("http-errors");
const {upload} = require('../../utils')
const { successResponse, failureResponse } = require('../../utils')


// 查询附件列表
router.get('/', async (req, res) => {
    try {
        const query = req.query
        const pages = {
            // 当前页
            currentPage: Math.abs(Number(query.currentPage)) || 1,
            // 页面显示数据条数
            pageSize: Math.abs(Number(query.pageSize)) || 10
        }

        // 计算偏移量
        const offset = (pages.currentPage - 1) * pages.pageSize

        const condition = {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar']
                }
            ],
            order: [['id', 'desc']],
            limit: pages.pageSize,
            offset
        }

        const { count, rows } = await Attachment.findAndCountAll(condition)

        successResponse(res, '查询成功', {
            attachments: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

// 删除附件接口
router.delete('/', async (req, res) => {
   try {
       const attachment = await getAttachment(req)

       // 删除阿里云中的文件
       await upload.client.delete(attachment.fullpath)

       // 删除掉库中的附件记录
       await attachment.destroy()

       successResponse(res, '删除附件成功')
   } catch (e) {
       failureResponse(res, e)
   }
})

// 公共方法：查询当前附件
async function getAttachment(req) {
    const { id } = req.query
    const attachment = await Attachment.findByPk(id)
    if (!attachment) throw new createHttpError.NotFound(`ID: ${id} 的附件未找到`)
    return attachment
}

module.exports = router

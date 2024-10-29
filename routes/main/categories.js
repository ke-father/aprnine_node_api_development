const express = require('express')
const router = express.Router()
const { Category } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')

router.get('/', async (req, res) => {
    try {
        const categories = await  Category.findAll({
            order: [['rank', 'asc'], ['id', 'desc']]
        })

        successResponse(res, '获取分类列表成功', {
            categories
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

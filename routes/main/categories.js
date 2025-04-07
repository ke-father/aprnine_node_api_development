const express = require('express')
const router = express.Router()
const { Category } = require('../../models')
const { failureResponse, successResponse } = require('../../utils')
const { getKey, setKey } = require('../../utils/redis')
const { CATEGORIES_KEY } = require('../enum/CONST')
router.get('/', async (req, res) => {
    try {
        let categories = await getKey(CATEGORIES_KEY)

        if (!categories) categories = await  Category.findAll({
            order: [['rank', 'asc'], ['id', 'desc']]
        })

        await setKey(CATEGORIES_KEY, categories)

        successResponse(res, '获取分类列表成功', {
            categories
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

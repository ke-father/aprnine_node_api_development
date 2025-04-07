const express = require('express');
const router = express.Router();
// 引入模型
const { User } = require('../../models')
const { Op, where} = require('sequelize')
const { successResponse, failureResponse} = require('../../utils')
const createHttpError = require("http-errors");
const {delKey} = require("../../utils/redis");

// 查询用户列表
router.get('/', async (req, res) => {
    try {
        // 获取查询参数
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

        // 定义查询条件
        const condition = {
            // 排序
            order: [['id', 'DESC']],
            // 查询查询条数 pageSize
            limit: pages.pageSize,
            // 偏移量
            offset
        }

        const queryType = {
            // Op.eq 为相等 精确查找
            email: () => ({ [Op.eq]: query.email }),
            userName: () => ({ [Op.eq]: query.userName }),
            // Op.like 为模糊查找
            nickname: () => ({ [Op.like]: `%${query.nickname}%` }),
            role: () => ({ [Op.eq]: query.role })
        }

        Object.keys(query).map(key => {
            if (key in queryType) {
                if (!('where' in condition)) condition.where = {}
                condition.where[key] = queryType[key]()
            }
        })

        // 获取数据库内容
        const { count, rows } = await User.findAndCountAll(condition)

        successResponse(res, '查询成功', {
            users: rows,
            pagination: {
                total: count,
                currentPage: pages.currentPage,
                pageSize: pages.pageSize
            }
        })
    } catch (e) {
        failureResponse(res, e, '查询用户列表失败')
    }
})

// 创建用户
router.post('/', async (req, res) => {
    try {
        // 创建用户
        const user = await User.create(filterBody(req.body))

        successResponse(res, '创建成功', user, 201)
    } catch (e) {
        failureResponse(res, e, '创建用户失败')
    }
})

// 更新用户
router.put('/:id', async (req, res) => {
    try {
        // 获取用户
        const user = await getUser(req)

        // 更新用户
        await user.update(filterBody(req.body))
        await clearCache(user)
        successResponse(res, '更新成功', user)
    } catch (e) {
        failureResponse(res, e, '更新用户失败')
    }
})

// 获取当前登录用户
router.get('/me', async (req, res) => {
    try {
        // 获取用户
        const user = req.user

        successResponse(res, '查询成功',  { user })
    } catch (e) {
        failureResponse(res, e, '查询当前登录用户失败')
    }
})

// 查询用户详情
router.get('/:id', async (req, res) => {
    try {
        // 获取用户
        const user = await getUser(req)

        successResponse(res, '查询成功', {user})
    } catch (e) {
        failureResponse(res, e, '查询用户详情失败')
    }
})

// 公共方法：查询当前用户
const getUser = async (req) => {
    // 获取用户id
    const { id } = req.params

    // 向数据库查询
    const user = await User.findByPk(id)

    // 用户未找到 抛出错误
    if (!user) throw new  createHttpError.NotFound(`ID: ${id} 的用户未找到`)

    return user

}

// 公共方法：白名单过滤
const filterBody = (body) => {
    const whiteList = ['email', 'username', 'nickname', 'password', 'role', 'sex']

    let returnBody = {}
    for (const key in body) {
        if (whiteList.includes(key)) {
            returnBody[key] = body[key]
        }
    }

    return returnBody
}

// 清除缓存
const clearCache = async (user) => {
    await delKey(`USER_KEY:${user.id}`)
}

module.exports = router

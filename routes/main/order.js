const express = require('express')
const router = express.Router()
const { Order, User, Membership } = require('../../models')
const {successResponse, failureResponse} = require("../../utils/responses");
const createHttpError = require("http-errors");
const {getKey, setKey} = require("../../utils/redis");
const { v4: uuidv4 } = require('uuid')

const MEMBERSHIPS_KEY = 'membership'

// 查询订单状态
router.get('/', async (req, res) => {
    try {
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
            ...getCondition(),
            where: { userId: req.userId },
            // 排序
            order: [['id', 'desc']],
            // 查询查询条数 pageSize
            limit: pages.pageSize,
            // 偏移量
            offset
        }

        let  queryKey = ['outTradeNo', 'tradeNo', 'status']
        queryKey.forEach((key) => {
            query[key] && (condition.where[key] = query[key])
        })

        const { count, rows } = await Order.findAndCountAll(condition)
        successResponse(res, '查询订单列表成功', {
            orders: rows,
            pagination: {
                total: count,
                ...pages
            }
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

// 查询订单详情
router.get('/:outTradeNo', async (req, res) => {
    try {
        const order = await getOrder(req)
        successResponse(res, '查询订单详情成功', order)
    } catch (e) {
        failureResponse(res, e)
    }
})

// 创建订单
router.post('/', async (req, res) => {
    try {
        const outTradeNo = uuidv4().replace(/-/g, '')
        const membership= await getMembership(req)

        const order = await Order.create({
            outTradeNo,
            userId:  req.userId,
            subject: membership.name,
            totalAmount: membership.price,
            status: 0
        })

        successResponse(res, '创建订单成功', {order})
    } catch (e) {
        failureResponse(res, e)
    }
})

/**
 * 公共方法：关联用户
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
    return {
        attributes: { exclude: ['id', 'UserId'] },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar']
            }
        ]
    }
}

/**
 * 公共方法：查询当前订单
 */
async function getOrder(req) {
    const { outTradeNo } = req.params;

    const order = await Order.findOne({
        ...getCondition(),
        where: {
            outTradeNo: outTradeNo,
            userId: req.userId        // 用户只能查看自己的订单
        },
    });

    if (!order) {
        throw new createHttpError.NotFound(`订单号: ${outTradeNo} 的订单未找到。`)
    }

    return order;
}

// 查询大会员信息
const getMembership = async (req) => {
    const { membershipId } = req.body
    if (!membershipId) throw new createHttpError.BadRequest('请选择要购买的大会员')

    let membership = await getKey(`${MEMBERSHIPS_KEY}:${membershipId}`)
    if (!membership) membership = await Membership.findByPk(membershipId)
    if (!membership) throw new createHttpError.NotFound('大会员不存在')

    await setKey(`${MEMBERSHIPS_KEY}:${membershipId}`, membership)


    return membership

}

module.exports = router

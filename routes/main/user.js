const express = require('express');
const router = express.Router()
const { User } = require('../../models');
const { successResponse, failureResponse } = require("../../utils");
const createHttpError = require("http-errors");
const bcrypt = require('bcryptjs');

/**
 * 查询当前登录用户详情
 * GET /users/me
 */
router.get('/me', async function (req, res) {
    try {
        const user = await getUser(req);
        successResponse(res, '查询当前用户信息成功。', { user });
    } catch (error) {
        failureResponse(res, error);
    }
});

// 更新当前用户信息
router.put('/info', async (req, res) => {
    try {
        const keyWords = ['nickname', 'sex', 'company', 'introduce', 'avatar']
        const body = {}
        keyWords.map(key => body[key] = req.body[key])

        const user = await getUser(req)
        await user.update(body)

        successResponse(res, '更新用户信息成功', { user })
    } catch (e) {
        failureResponse(req, e)
    }
})

// 更新账户信息 账户信息更新需要校验密码
router.put('/account', async (req, res) => {
    try {
        const keywords = ['email', 'username', 'current_password', 'password', 'passwordConfirmation']
        const body = {}
        keywords.map(key => body[key] = req.body[key])

        if (!body['current_password']) throw new  createHttpError.BadRequest('当前密码必须填写。')

        if (body['passwordConfirmation'] !== body['password']) throw new  createHttpError.BadRequest('两次输入的密码不一致')

        // 获取用户信息与密码
        const user = await getUser(req, true)

        const isPasswordValid = bcrypt.compareSync(body['current_password'], user.password)
        if (!isPasswordValid) throw new  createHttpError.BadRequest('当前密码不正确。')

        await user.update(body)
        delete user.dataValues.password

        successResponse(res, '更新账户信息成功', { user })
    } catch (e) {
        failureResponse(res, e)
    }
})


/**
 * 公共方法：查询当前用户
 */
async function getUser(req, showPassword = false) {
    const id = req.userId;

    let condition = {}
    if (!showPassword) condition = { attributes: { exclude: ['password'] } }

    const user = await User.findByPk(id, condition);

    if (!user)  throw new  createHttpError.NotFound(`ID: ${ id }的用户未找到。`)

    return user;
}

module.exports = router;

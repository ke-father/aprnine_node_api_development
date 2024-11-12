const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { Op } = require('sequelize');
const {   successResponse, failureResponse } = require('../../utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../../middlewares/admin-auth');
const createHttpError = require("http-errors");

/**
 * 管理员登录
 * POST /admin/auth/sign_in
 */
router.post(`/sign_in`, async (req, res) => {
    try {
        const { login, password } = req.body

        // 判断是否填写账户名
        if (!login) throw new  createHttpError.BadRequest('邮箱/用户名必须填写')
        // 判断是否填写密码
        if (!password) throw new  createHttpError.BadRequest('密码必须填写')
        // 验证密码
        if (password.length < 6 || password.length > 45) throw new  createHttpError.BadRequest('密码长度需要在6 ~ 45个字符之间')

        const condition = {
            where: {
                // 或者
                [Op.or]: [
                    { email: login },
                    { username: login }
                ]
            }
        }
        // 查找用户
        const user = await User.findOne(condition)
        if (!user) throw new  createHttpError.NotFound('用户不存在')

        // 验证密码
        const isValid = await bcrypt.compareSync(password, user.password)
        // 验证错误
        if (!isValid) throw new  createHttpError.Unauthorized('密码错误')

        console.log(user.role, ROLES.ADMIN)

        // 判断是否为管理员
        if (user.role !== ROLES.ADMIN) throw new  createHttpError.Unauthorized('您没有权限登陆管理员后台')

        // 生成token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        successResponse(res, '登录成功。', {
            token
        });
    } catch (error) {
        failureResponse(res, error);
    }
});

module.exports = router;

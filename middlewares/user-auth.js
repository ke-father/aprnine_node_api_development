const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError, successResponse, failureResponse } = require('../utils');

module.exports = async (req, res, next) => {
    try {
        // 判断token是否存在
        const { token } = req.headers;
        if (!token) throw new UnauthorizedError('当前接口需要认证才能登陆');

        // 验证token
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        // 获取用户
        const user = await User.findByPk(userId);
        if (!user) throw new UnauthorizedError('用户不存在');

        // 判断用户身份
        if (user.role !== ROLES.ADMIN) throw new UnauthorizedError('您没有权限访问该接口');

        // 保存用户
        req.user = user;

        next();
    } catch (error) {
        failureResponse(res, error);
    }
};

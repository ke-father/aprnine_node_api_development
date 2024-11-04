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

        // 保存用户
        req.userId = userId;

        next();
    } catch (error) {
        failureResponse(res, error);
    }
};

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, failureResponse } = require('../utils');
const createHttpError = require("http-errors");

module.exports = async (req, res, next) => {
    try {
        // 判断token是否存在
        const { token } = req.headers;
        if (!token) throw new  createHttpError.Unauthorized('当前接口需要认证才能登陆');

        // 验证token
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        // 保存用户
        req.userId = userId;

        next();
    } catch (error) {
        failureResponse(res, error);
    }
};

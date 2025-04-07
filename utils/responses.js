const createError = require('http-errors')
const multer = require('multer')
const logger = require('../utils/logger')

/**
 * 请求成功
 * @param res 响应参数
 * @param message 响应信息
 * @param data 数据
 * @param code 状态码
 */
const successResponse = (res, message, data = {}, code = 200) => {
    res.status(code)
        .json({
            status: true,
            message,
            data
        })
}

/**
 * 请求失败
 * @param res
 * @param error
 * @param message
 */
const failureResponse = (res, error, message = '服务器错误') => {
    try {
        const setBody = (status, message, errors) => {
            res.status(status)
                .json({
                    status: false,
                    message,
                    errors: Array.isArray(errors) ? errors : [errors]
                })
        }

        const errorMap = new Map([
            // 验证错误
            ['SequelizeValidationError', () => setBody(400, '请求参数错误', error.errors.map(e => e.message))],
            ['JsonWebTokenError', () => setBody(401, '认证失败', ['您提交的token错误'])],
            ['TokenExpiredError', () => setBody(401, '认证失败', ['您提交的token已过期'])],
            ['MulterError', () => setBody(413, '上传文件大小超出限制', ['上传文件过大'])],
            ['default', () => {
                logger.error('服务器错误：', error)
                return setBody(500, message, [error.message])
            }],
        ])

        if (createError.isHttpError(error)) setBody(error.status, '请求失败', error.message)
        else {
            const errorObject = errorMap.get(error.name)
            if (errorObject) errorObject()
            else errorMap.get('default')()
        }
    } catch (e) {
        logger.error('服务器错误：', e)
    }
}

module.exports = {
    successResponse,
    failureResponse
}

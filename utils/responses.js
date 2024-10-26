const { UnauthorizedError, NotFoundError, BadRequestError } = require('./errors')

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
    const setBody = (status, message, errors) => {
        res.status(status)
            .json({
                status: false,
                message,
                errors
            })
    }

    const errorMap = new Map([
        // 验证错误
        ['SequelizeValidationError', () => setBody(400, '请求参数错误', error.errors.map(e => e.message))],
        ['JsonWebTokenError', () => setBody(401, '认证失败', ['您提交的token错误'])],
        ['TokenExpiredError', () => setBody(401, '认证失败', ['您提交的token已过期'])],
        [BadRequestError.name, () => setBody(400, '请求参数错误', [error.message])],
        [UnauthorizedError.name, () => setBody(401, '认证失败', [error.message])],
        // 自定义错误
        [NotFoundError.name, () => setBody(404, '资源不存在', [error.message])],
        ['default', () => setBody(500, message, [error.message])],
    ])


    const errorObject = errorMap.get(error.name)
    errorObject ? errorObject() : errorMap.get('default')()
}

module.exports = {
    successResponse,
    failureResponse
}

const express = require('express')
const router = express.Router()
const createHttpError = require('http-errors')
const multer = require('multer')
const { successResponse, failureResponse, upload } = require('../utils')

router.post('/aliyun', (req, res) => {
    try {
        upload.singleFileUpload(req, res, (err) => {
            if (err) return failureResponse(res, err)

            if (!req.file) return createHttpError.BadRequest('请选择要上传的文件')

            successResponse(res, '上传成功', { file: req.file })
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

module.exports = router

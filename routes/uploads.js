const express = require('express')
const router = express.Router()
const createHttpError = require('http-errors')
const { Attachment } = require('../models')
const { successResponse, failureResponse, upload } = require('../utils')
const { v4: uuidv4 } = require('uuid');
const moment = require("moment/moment");

router.post('/aliyun', (req, res) => {
    try {
        upload.singleFileUpload(req, res, (err) => {
            if (err) return failureResponse(res, err)

            if (!req.file) return createHttpError.BadRequest('请选择要上传的文件')

            // 上传成功后,保存到数据库
            Attachment.create({
                ...req.file,
                userId: req.userId,
                fullpath: req.file.path + '/' + req.file.filename,
            })

            successResponse(res, '上传成功', { file: req.file })
        })
    } catch (e) {
        failureResponse(res, e)
    }
})

// 获取阿里云oss直传信息
router.get('/aliyun_direct', async (req, res) => {
    // 有效期
    const date = moment().add(1, 'days')

    // 自定义上传目录以及文件名
    const key = `uploads/${uuidv4()}`

    const policy = {
        expiration: date.toISOString(),  // 限制有效期
        conditions:
            [
                ['content-length-range', 0, 5 * 1024 * 1024], // 限制上传文件的大小为：5MB
                { bucket: upload.client.options.bucket }, // 限制上传的 bucket
                ['eq', '$key', key], // 限制上传的文件名
                ['in', '$content-type', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']], // 限制文件类型
            ],
    };

    // 签名
    const formData = await upload.client.calculatePostSignature(policy)

    // bucket 域名（阿里云上传地址）
    const host =
        `https://${upload.config.bucket}.${(await upload.client.getBucketLocation()).location}.aliyuncs.com`.toString();

    // 返回参数
    const params = {
        expire: date.format('YYYY-MM-DD HH:mm:ss'),
        policy: formData.policy,
        signature: formData.Signature,
        accessid: formData.OSSAccessKeyId,
        host,
        key,
        url: host + '/' + key,
    };

    successResponse(res, '获取阿里云 OSS 授权信息成功。', params);
})

module.exports = router

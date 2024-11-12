const OSS = require('ali-oss');
const MAO = require('multer-aliyun-oss')
// 图片上传中间件
const multer = require('multer')
const createHttpError = require('http-errors')

// 支持上传的文件大小
const MAX_FILE_SIZE =  5 * 1024 * 1024

const config = {
    region: process.env.ALIYUN_REGION,
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    bucket: process.env.ALIYUN_BUCKET
}

// 创建OSS实例
const client = new OSS(config)

// multer信息
const upload = multer({
    storage: MAO({
        // 配置
        config,
        // 自定义上传目录
        destination: 'uploads'
    }),
    limits: {
        // 设置上传文件大小 5M
        fileSize: MAX_FILE_SIZE
    },
    // 过滤文件
    fileFilter: (req, file, cb) => {
        // 获取文件后缀
        const ext = file.mimetype.split('/')[0]

        // 校验上传类型
        if (ext !== 'image') return cb(new createHttpError.BadRequest('只允许上传图片'))

        cb(null, true)
    }
})

// 设置只能单文件上传
const singleFileUpload = upload.single('file')

module.exports = {
    MAX_FILE_SIZE,
    config,
    client,
    singleFileUpload
}

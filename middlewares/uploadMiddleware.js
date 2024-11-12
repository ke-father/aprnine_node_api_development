const {successResponse, upload} = require("../utils");
const {failureResponse} = require("../utils/responses");
const multer = require("multer");
module.exports = (req, res, next) => {
    try {

        // let fileIsQualified = true
        // req.files.map(file => {
        //     if (file.size > upload.MAX_FILE_SIZE) fileIsQualified = false
        // })
        const fileSize = req.file.size
        // 文件不合规
        if (fileSize > upload.MAX_FILE_SIZE) throw new multer.MulterError(413)

        delete req.file

        next()
    } catch (e) {
        failureResponse(res, e)
    }
}

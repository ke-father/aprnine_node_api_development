const nodemailer = require('nodemailer')
const logger = require('./logger')

// 邮箱配置
const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAIlER_PORT,
    secure: process.env.MAILER_SECURE,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    }
})

/**
 * 发送邮件
 * @param email 邮箱
 * @param subject 邮件主题
 * @param html 邮件内容
 * @return {Promise<void>}
 */
const sendMail = async (email, subject, html) => {
   try {
       await transporter.sendMail({
           from: process.env.MAILER_USER,
           to: email,
           subject,
           html
       })
   } catch (e) {
       logger.error('邮件发送失败：', e)
   }
}

module.exports = sendMail

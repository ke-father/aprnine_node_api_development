const amqp = require('amqplib')
const sendMail = require('./mail')
const logger = require("./logger");

// 创建全局RabbitMQ链接和通道
let connection
let channel

// 链接到RabbitMQ
const connectToRabbitMQ = async () => {
    if (connection && channel) return true

    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        // 创建队列
        await channel.assertQueue('mail_queue', { durable: true })
    } catch (e) {
        logger.error('RabbitMQ 连接失败', e)
    }
}

// 邮件队列产生者 （发送消息）
const mailProducer = async (msg) => {
    try {
        await connectToRabbitMQ()

        channel.sendToQueue('mail_queue', Buffer.from(JSON.stringify(msg)), { persistent: true })
    } catch (e) {
        logger.error('邮件队列生产者错误：', e)
    }
}

// 邮件队列消费者 （接收消息）
const mailConsumer = async () => {
    try {
        await connectToRabbitMQ()

        channel.consume('mail_queue', async (msg) => {
            const message = JSON.parse(msg.content.toString())
            await sendMail(message.to, message.subject, message.html)
        }, {
            noAck: true
        })
    } catch (e) {
        logger.error('邮件队列消费者错误：', e)
    }
}

module.exports = {
    mailProducer,
    mailConsumer
}

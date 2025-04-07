const {mailConsumer} = require("./utils/rabbit-mq");

(
    async () => {
        await mailConsumer()
        console.warn('[rabbitMQ] 邮件队列消费者启动成功')
    }
)()

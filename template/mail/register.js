module.exports = (user) => {
    return {
        to: user.email,
        subject: '注册成功通知',
        html: (
            `你好, <span style="color: red">${user.nickname}</span>。<br />
            您的注册信息为:<br />
            用户名：${user.username}<br />
            <br />
            感谢您的支持`
        )
    }
}

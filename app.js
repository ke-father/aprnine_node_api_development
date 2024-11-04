const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

// 配置环境变量
require('dotenv').config();

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 配置跨域
const corsOptions = {
    // origin: ['http://localhost:3000'],
    // origin: 'http://aprnine.cloud'
}

app.use(cors(corsOptions))

app.use('/', indexRouter);

module.exports = app;

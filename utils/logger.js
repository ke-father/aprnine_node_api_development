const winston = require('winston')
const MySQLTransport = require('winston-mysql')

const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const options = {
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    table: 'Logs'
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'aprnine-api' },
    transports: [
        new MySQLTransport(options)
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger

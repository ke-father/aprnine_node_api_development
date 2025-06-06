'use strict';
const {
    Model
} = require('sequelize');
const moment = require("moment/moment");
const { URL_REG } = require('../utils')

moment.locale('zh-cn')
module.exports = (sequelize, DataTypes) => {
    class Chapter extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Chapter.belongsTo(models.Course, {
                as: 'course'
            })
        }
    }

    Chapter.init({
            courseId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {msg: '课程ID必须填写。'},
                    notEmpty: {msg: '课程ID不能为空。'},
                    async isPresent(value) {
                        const course = await sequelize.models.Course.findByPk(value)
                        if (!course) {
                            throw new Error(`ID为：${value} 的课程不存在。`);
                        }
                    }
                }
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {msg: '标题必须填写。'},
                    notEmpty: {msg: '标题不能为空。'},
                    len: {args: [2, 45], msg: '标题长度必须是2 ~ 45之间。'}
                }
            },
            content: DataTypes.TEXT,
            video: {
                type: DataTypes.STRING,
                validate: {
                    isUrl (value) {
                        if (value && !URL_REG.test(value)) throw new Error('视频链接格式不正确。')
                    }
                }
            },
            rank: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {msg: '排序必须填写。'},
                    notEmpty: {msg: '排序不能为空。'},
                    isInt: {msg: '排序必须为整数。'},
                    isPositive(value) {
                        if (value <= 0) {
                            throw new Error('排序必须是正整数。');
                        }
                    }
                }
            },
            createdAt: {
                type: DataTypes.DATE,
                get () {
                    return moment(this.getDataValue(Chapter.createdAt)).format('LL')
                },
            },
            updatedAt: {
                type: DataTypes.DATE,
                get () {
                    return moment(this.getDataValue(Chapter.updatedAt)).format('LL')
                }
            },
            free: {
                type: DataTypes.BOOLEAN,
                validate: {
                    isIn: { args: [[true, false]], msg: '是否免费章节的值必须是，推荐：true 不推荐：false。' }
                }
            },
        },
        {
            sequelize,
            modelName: 'Chapter',
        });
    return Chapter;
};

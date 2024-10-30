'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment/moment')
moment.locale('zh-cn')

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // belongsTo 属于
      models.Course.belongsTo(models.Category, {
        // 响应时别名
        as: 'category'
      })
      models.Course.belongsTo(models.User, {
        as: 'user'
      })
      models.Course.hasMany(models.Chapter, {
        as: 'chapters'
      })
    }
  }
  Course.init({
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        notNull: {
          msg: '分类ID必须填写'
        },
        notEmpty: {
          msg: '分类ID不能为空'
        },
        async isPresent (value) {
          const category = await sequelize.models.Category.findByPk(value)
          if (!category) throw new Error(`ID: ${value} 分类不存在`)
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        notNull: {
          msg: '用户ID必须填写'
        },
        notEmpty: {
          msg: '用户ID不能为空'
        },
        async isPresent (value) {
          const user = await sequelize.models.User.findByPk(value)
          if (!user) throw new Error(`ID: ${value} 用户不存在`)
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '名称必须填写'
        },
        notEmpty: {
          msg: '名称不能为空'
        },
        len: {
          args: [2, 45],
          msg: '名称长度需要在2 ~ 45个字符之间'
        },
        async isUnique (value) {
          const user = await Course.findByPk(value)
          if (user) throw new Error('该名称已存在，请选择其他名称。')
        }
      }
    },
    image: DataTypes.STRING,
    recommended: DataTypes.BOOLEAN,
    introductory: DataTypes.BOOLEAN,
    content: DataTypes.TEXT,
    likesCount: DataTypes.INTEGER,
    chaptersCount: DataTypes.INTEGER,
    createdAt: {
      type: DataTypes.DATE,
      get () {
        return moment(this.getDataValue(Course.createdAt)).format('LL')
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      get () {
        return moment(this.getDataValue(Course.updatedAt)).format('LL')
      }
    }
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};

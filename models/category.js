'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 一对多
      models.Category.hasMany(models.Course, { as: 'courses' })
    }
  }
  Category.init({
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
          msg: '分类名称长度需要在2 ~ 45个字符之间'
        },
        async isUnique (value) {
          const user = await Category.findOne({ where: { name: value } })
          if (user) throw new Error('该名称已存在，请选择其他名称。')
        }
      }
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: '排序值必须填写'
        },
        notEmpty: {
          msg: '排序值不能为空'
        },
        isInt: {
          msg: '排序值必须为整数'
        },
        isPositive (value) {
          if (value < 0) throw new Error('排序值不能为负数')
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Article.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '文章标题不能为空'
        },
        notEmpty: {
          msg: '文章标题不能为空'
        },
        len: {
          args: [2, 45],
          msg: '标题长度需要在2 ~ 45个字符之间'
        }
      }
    },
    content: DataTypes.TEXT,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Article',
    paranoid: true
  });
  return Article;
};

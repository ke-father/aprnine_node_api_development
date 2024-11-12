'use strict';
const {
  Model
} = require('sequelize');
// 引入加密
const bcrypt = require('bcryptjs')
const createHttpError = require("http-errors");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.hasMany(models.Course, { as: 'courses' })
      models.User.belongsToMany(models.Course, { through: models.Like, foreignKey: 'userId', as: 'likeCourses' })
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: { msg: '该邮箱已存在，请选择其他邮箱。' },
      validate: {
        notNull: {
          msg: '邮箱必须填写'
        },
        notEmpty: {
          msg: '邮箱不能为空'
        },
        isEmail: {
          msg: '请输入正确的邮箱格式'
        },
        async isUnique (value) {
          const user = await User.findOne({ where: { email: value } })
          if (user) throw new Error('该邮箱已存在，请选择其他邮箱。')
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: '该用户名已存在，请选择其他用户名。' },
      validate: {
        notNull: {
          msg: '用户名必须填写'
        },
        notEmpty: {
          msg: '用户名不能为空'
        },
        len: {
          args: [2, 45],
          msg: '用户名长度需要在2 ~ 45个字符之间'
        },
        async isUnique (value) {
          const user = await User.findOne({ where: { username: value } })
          if (user) throw new Error('用户名已存在')
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '密码必须填写'
        },
        notEmpty: {
          msg: '密码不能为空'
        }
      },
      set (value) {
        if (value.length >= 6 && value.length <= 45) this.setDataValue('password', bcrypt.hashSync(value, 10))
        else throw new createHttpError.BadRequest('密码长度需要在6 ~ 45个字符之间')
      }
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '昵称必须填写'
        },
        notEmpty: {
          msg: '昵称不能为空'
        },
        len: {
          args: [2, 45],
          msg: '用户名长度需要在2 ~ 45个字符之间'
        },
      }
    },
    sex: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: '性别必须填写'
        },
        notEmpty: {
          msg: '性别不能为空'
        },
        isInt: {
          args: [[0,1,2]],
          msg: '性别只能是, 0: 男, 1: 女, 2: 未知'
        }
      }
    },
    company: DataTypes.STRING,
    introduce: DataTypes.TEXT,
    role: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: '角色必须填写'
        },
        notEmpty: {
          msg: '角色不能为空'
        },
        isInt: {
          args: [[0,100]],
          msg: '角色只能是, 0: 普通用户, 100: 管理员'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      validate: {
        isUrl: { msg: '请输入正确的头像链接' }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

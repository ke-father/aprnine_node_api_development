'use strict';
const moment = require('moment/moment');

const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@qq.com',
        username: 'admin',
        password: bcrypt.hashSync('123456', 10),
        nickname: '管理员',
        sex: 1,
        role: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user1@qq.com',
        username: 'user1',
        password: bcrypt.hashSync('123456', 10),
        nickname: '普通用户',
        sex: 1,
        role: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user2@qq.com',
        username: 'user2',
        password: bcrypt.hashSync('123456', 10),
        nickname: '普通用户',
        sex: 1,
        role: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user3@qq.com',
        username: 'user3',
        password: bcrypt.hashSync('123456', 10),
        nickname: '普通用户',
        sex: 1,
        role: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'member@clwy.cn',
        username: 'member',
        password: bcrypt.hashSync('123123', 10),
        nickname: '大会员用户',
        sex: 1,
        role: 1,
        membershipExpiredAt: moment().add(1, 'year').toDate(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

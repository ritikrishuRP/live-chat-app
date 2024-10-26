const Sequelize = require('sequelize');
const sequelize = require('../utils/db');

const User = sequelize.define('User',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    name: {
        type: Sequelize.STRING,
        required: true
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    phone: {
        type: Sequelize.STRING(15),
        required: true
    },
    password: {
        type: Sequelize.STRING,
        required: true
    }
});

module.exports = User;

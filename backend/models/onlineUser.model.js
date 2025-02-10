const Sequelize = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./user.model');

const OnlineUser = sequelize.define('OnlineUser', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    loginTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

// Associate OnlineUser with User
OnlineUser.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(OnlineUser, { foreignKey: 'userId' });

module.exports = OnlineUser;
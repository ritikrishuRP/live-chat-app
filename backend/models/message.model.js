// models/Message.js
const Sequelize = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./user.model');

const Message = sequelize.define('Message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

// Associate Message with User
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Message, { foreignKey: 'userId' });

module.exports = Message;

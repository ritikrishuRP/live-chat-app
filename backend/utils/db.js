const Sequelize = require('sequelize');
const sequelize = new Sequelize('live-chat-app', 'root', 'asunny@121',{
    dialect: 'mysql',
    host: 'localhost'
});
module.exports = sequelize;
const Sequelize = require('sequelize');
const sequelize = require('../utils/db'); // Adjust if the db file path is different

const Group = sequelize.define('Group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Group;

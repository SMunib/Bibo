const { DataTypes } = require('sequelize');
const { sequelize } = require('../startup/db');

const Token = sequelize.define('Token',{
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = Token;
const { DataTypes } = require('sequelize');
const {sequelize} = require('../startup/db');

const Purchase = sequelize.define('Purchase', {
    name: {
        type: DataTypes.STRING,
        allowNull : false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false  
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    displayPicture: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

module.exports = Purchase;
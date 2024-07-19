const { DataTypes } = require('sequelize');
const { sequelize } = require('../startup/db');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull : false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false  
    },
    inStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    displayPicture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deleteStatus: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

module.exports = Product
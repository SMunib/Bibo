const { DataTypes } = require('sequelize');
const { sequelize } = require('../startup/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
    }
});

module.exports = Product
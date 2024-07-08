const { DataTypes} = require('sequelize');
const { sequelize } = require('../startup/db');
const jwt = require('jsonwebtoken');

const User = sequelize.define('User', {
    companyName : {
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [5,5],
        },
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [11,11],
        },
    },
    address:{
      type: DataTypes.STRING,
      allowNull:false  
    },
    einNumber: {
        type: DataTypes.STRING,
        allowNull:false
    },
    storeCategory: {
        type: DataTypes.STRING,
        allowNull:false
    }  
});

User.prototype.generateToken = function(){
    const jwtkey = process.env.JWT_SECRET_KEY;
    console.log(jwtkey);
    const token = jwt.sign({id: this.id},jwtkey,{expiresIn: '1h'});
    return token;
}

module.exports = User;
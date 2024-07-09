const Product = require('../models/product');
const User = require('../models/user');
const Token = require('../models/tokens');

const defineAssociations = async () => {
    Product.belongsTo(User,{
        foreignKey: 'ownerid',
        targetKey:'id',
        as: 'owner'
    });

    User.hasMany(Product,{
        foreignKey: 'ownerid',
        sourceKey:'id',
        as: 'products',
    });

    User.hasOne(Token, {
        foreignKey: 'userId',
        as: 'token'
    });

    Token.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
};

module.exports = defineAssociations;
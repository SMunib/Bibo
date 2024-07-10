const Product = require('../models/product');
const User = require('../models/user');
const Token = require('../models/tokens');
const Purchase = require('../models/purchases');

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

    User.hasMany(Purchase,{
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'purchases'
    });

    Purchase.belongsTo(User,{
        foreignKey: 'userId',
        targetKey:'id',
        as:'user'
    });
};

module.exports = defineAssociations;
const Product = require('../models/product');
const User = require('../models/user');

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
};

module.exports = defineAssociations
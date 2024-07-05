const express = require('express');
const app = express();
const {sequelize,syncDB,testConnection} = require('./startup/db');
const User = require('./models/user');
const Product =  require('./models/product');
const defineAssociations = require('./connect/Association');

async function initialize(){
    await testConnection();
    await defineAssociations();
    await syncDB();

    app.use(express.json());
    app.use(express.urlencoded({extended:true}));

    app.use('/uploads',express.static('uploads'));

    require('./startup/routes')(app);

    const port = process.env.port || 3000;
    app.listen(port,() => console.log(`server is running on port: ${port}`));
}

initialize();

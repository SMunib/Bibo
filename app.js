const express = require('express');
const app = express();
const {sequelize,syncDB,testConnection} = require('./startup/db');
const User = require('./models/user');

async function initialize(){
    await testConnection();
    await syncDB();

    require('./startup/routes')(app);
    // require('./startup/initDb')();

    const port = process.env.port || 3000;
    app.listen(port,() => console.log(`server is running on port: ${port}`));
}

initialize();

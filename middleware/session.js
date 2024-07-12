// sessionConfig.js

const session = require('express-session');
const flash = require('express-flash');
const dotenv = require('dotenv');
dotenv.config();

function configureSession(app) {
    app.use(
        session({
            secret: process.env.jwtSecretKey,
            resave: false,
            saveUninitialized: true,
            cookie: { secure: false },
        })
    );
    app.use(flash());
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        next();
    });
}

module.exports = configureSession;

const express = require('express');
const login = require('../routes/login');
const signup = require('../routes/signup');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/login',login);
    app.use('/api/signup',signup);
}
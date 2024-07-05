const express = require('express');
const login = require('../routes/login');
const signup = require('../routes/signup');
const product = require('../routes/product');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/login',login);
    app.use('/api/signup',signup);
    app.use('/api/product',product);
}
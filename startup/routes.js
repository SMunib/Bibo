const express = require("express");
const login = require("../routes/login");
const signup = require("../routes/signup");
const product = require("../routes/product");
const purchase = require("../routes/purchases");
const renders = require("../routes/renders");
const verifyOtp = require("../routes/verifyOtp");
const admin = require("../routes/admin");

module.exports = function (app) {
  const models = app.get("models");
  app.use((req, res, next) => {
    req.models = models;
    next();
  });

  app.use(express.json());
  app.use("/api/login", login);
  app.use("/api/signup", signup);
  app.use("/api/product", product);
  app.use("/api/purchase", purchase);
  app.use("/api/verifyotp", verifyOtp);
  app.use("/api/admin", admin);
  app.use("/", renders);
};

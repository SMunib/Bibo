const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const upload = multer();
const session = require('express-session');
const flash = require('express-flash');
const app = express();
dotenv.config();

const defineAssociations = require("./connect/Association");
const { sequelize, syncDB, testConnection } = require("./startup/db");
const configureSession = require('./middleware/session');
const setupRoutes = require("./startup/routes");

const User = require("./models/user");
const Product = require("./models/product");
const Token = require("./models/tokens");
const Purchase = require("./models/purchases");

async function initialize() {
  try {
    await testConnection();
    await defineAssociations();
    await syncDB();

    app.use(express.json());
    // app.use(express.cookieParser());
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
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
      next();
    });
    app.use(express.urlencoded({ extended: true }));
    app.use(upload.any());
    app.use("/uploads", express.static("uploads"));
    app.use("/logos", express.static("logos"));
    app.set("view engine", "ejs");

    setupRoutes(app);
    configureSession(app);

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`server is running on port: ${port}`));
  } catch (err) {
    console.err("Failed to initialize: ", err);
    process.exit(1);
  }
}

initialize();

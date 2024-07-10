const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const upload = multer();

const defineAssociations = require("./connect/Association");
const { sequelize, syncDB, testConnection } = require("./startup/db");
const setupRoutes = require("./startup/routes");

const User = require("./models/user");
const Product = require("./models/product");
const Token = require("./models/tokens");
const Purchase = require("./models/purchases");

async function initialize() {
  await testConnection();
  await defineAssociations();
  await syncDB();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(upload.any());
  app.use("/uploads", express.static("uploads"));

  setupRoutes(app);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`server is running on port: ${port}`));
}

initialize();

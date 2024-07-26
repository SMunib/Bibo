const { sequelize, syncDB, testConnection } = require("./db");
const defineAssociations = require("../connect/Association");

async function initializeDB() {
  await testConnection();
  await defineAssociations();
  await syncDB();
}

module.exports = { initializeDB };

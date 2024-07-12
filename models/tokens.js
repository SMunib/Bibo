const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");

const Token = sequelize.define("Token", {
  key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  keyType: {
    type: DataTypes.ENUM("access", "reset"),
    allowNull: true,
  },
});

module.exports = Token;

const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");

const Messages = sequelize.define(
  "Messages",
  {
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Messages;

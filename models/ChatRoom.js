const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: ["private", "public"],
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = ChatRoom;

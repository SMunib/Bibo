const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../startup/db");

const UserChatRoom = sequelize.define(
  "UserChatRoom",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
    chatRoomId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ChatRoom",
        key: "id",
      },
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  },
  {
    timestamps: false,
  }
);

module.exports = UserChatRoom;

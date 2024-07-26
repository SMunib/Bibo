const Product = require("../models/product");
const User = require("../models/user");
const Token = require("../models/tokens");
const Purchase = require("../models/purchases");
const Otp = require("../models/otp");
const ChatRoom = require("../models/ChatRoom");
const Messages = require("../models/messages");

const defineAssociations = async () => {
  Product.belongsTo(User, {
    foreignKey: "ownerid",
    targetKey: "id",
    as: "owner",
  });

  User.hasMany(Product, {
    foreignKey: "ownerid",
    sourceKey: "id",
    as: "products",
  });

  User.hasOne(Token, {
    foreignKey: "userId",
    as: "token",
  });

  Token.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  User.hasMany(Purchase, {
    foreignKey: "userId",
    targetKey: "id",
    as: "purchases",
  });

  Purchase.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "id",
    as: "user",
  });

  User.hasMany(Otp, {
    foreignKey: "userId",
    sourceKey: "id",
    as: "otps",
  });

  Otp.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "id",
    as: "user",
  });

  ChatRoom.hasMany(Messages, {
    foreignKey: "chatRoomId",
    as: "messages",
  });

  Messages.belongsTo(ChatRoom, {
    foreignKey: "chatRoomId",
    as: "chatRoom",
  });

  User.belongsToMany(ChatRoom, {
    through: "UserChatRoom",
    foreignKey: "userId",
    otherKey: "chatRoomId",
    as: "chatrooms",
  });

  ChatRoom.belongsToMany(User, {
    through: "UserChatRoom",
    foreignKey: "chatRoomId",
    otherKey: "userId",
    as: "users",
  });

  User.hasMany(Messages, {
    foreignKey: "userId",
    as: "messages",
  });

  Messages.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
};

module.exports = defineAssociations;

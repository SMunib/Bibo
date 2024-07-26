const { Op } = require("sequelize");
const Messages = require("../models/messages");
const UserChatRoom = require("../models/UserChatRoom");

async function chatHistoryRoutes(io, socket) {
  socket.on("getChatHistory", async ({ roomId }) => {
    try {
      const userId = socket.user.id;
      const userInRoom = await UserChatRoom.findOne({
        where: {
          userId: userId,
          chatRoomId: roomId,
        },
      });

      if (!userInRoom) {
        socket.emit("chatHistoryError", "You are not a member of this room");
        return;
      }

      const chatHistory = await Messages.findAll({
        where: {
          chatRoomId: roomId,
          isDeleted: false,
        },
        order: [["createdAt", "ASC"]],
      });

      io.to(roomId).emit("chatHistory", chatHistory);
    } catch (err) {
      console.log("error fetching chathistory: " + err);
      socket.emit("chatHistoryError", "Error fetching history: ", err);
    }
  });
}

module.exports = chatHistoryRoutes;

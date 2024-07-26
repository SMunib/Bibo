const User = require("../models/user");
const ChatRoom = require("../models/ChatRoom");
const { literal } = require("sequelize");

async function chatRoutes(io, socket) {
  try {
    socket.on("listing", async () => {
      const user = socket.user;
      const nickname = user.companyName;
      // Notify other users about the new connection
      io.emit("message", `${nickname} has connected`);

      const userChatRooms = await ChatRoom.findAll({
        include: [
          {
            model: User,
            as: "users",
            where: { id: user.id },
            attributes: ["id", "companyName"],
            through: { attributes: [] },
          },
        ],
        attributes: {
          include: [
            [
              literal(`(SELECT message 
              FROM messages AS latestMessage
              WHERE latestMessage.chatRoomId = ChatRoom.id
              AND latestMessage.isDeleted = false
              ORDER BY latestMessage.createdAt DESC
              LIMIT 1
            )`),
              "latestMessageContent",
            ],
            [
              literal(`(
              SELECT MAX(createdAt)
              FROM messages AS latestMessageTime
              WHERE latestMessageTime.chatRoomId = ChatRoom.id
              AND latestMessageTime.isDeleted = false
            )`),
              "latestMessageTime",
            ],
          ],
        },
        group: ["ChatRoom.id"],
        order: [[literal("latestMessageTime"), "DESC"]],
      });

      const chatRoomDetails = userChatRooms.map((room) => {
        socket.join(room.id);
        io.to(room.id).emit(
          "message",
          `${nickname} has joined the chat room ${room.name}`
        );
        let roomName;
        if (room.type === "private") {
          const otherUser = room.users.find((u) => u.id !== user.id);
          roomName = otherUser ? otherUser.companyName : room.name;
        } else {
          roomName = room.name;
        }
        return {
          roomId: room.id,
          roomName: roomName,
          latestMessage:
            room.getDataValue("latestMessageContent") || "no message yet",
          latestMessageTime: room.getDataValue("latestMessageTime"),
        };
      });

      socket.emit("chatRoomListings", chatRoomDetails);
    });
    // Handle typing indicator
    socket.on("typing", (roomId) => {
      io.to(roomId).emit("typing", `${nickname} is typing...`);
    });

    socket.on("stopTyping", (roomId) => {
      io.to(roomId).emit("stopTyping");
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("A user has disconnected");
      io.emit("message", `${nickname} has disconnected`);
      userChatRooms.forEach((room) => {
        io.to(room.id).emit(
          "message",
          `${nickname} has left the room ${room.name}`
        );
      });
    });
  } catch (error) {
    console.error("Error in chatRoutes:", error);
    socket.emit("message", "An error occurred while connecting to chat rooms.");
  }
}

module.exports = chatRoutes;
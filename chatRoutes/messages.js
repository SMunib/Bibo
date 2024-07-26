const Messages = require("../models/messages");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/user");
const UserChatRoom = require("../models/UserChatRoom");

async function messageRoutes(io, socket) {
  socket.on("joinPrivateRoom", async ({ recipientId }) => {
    try {
      const user = socket.user;
      const chatroomName = `private-${Math.min(
        user.id,
        recipientId
      )}-${Math.max(user.id, recipientId)}`;

      const recipient = await User.findByPk(recipientId);
      if (!recipient) {
        socket.emit("error", "User does not exist");
        return;
      }

      let chatroom = await ChatRoom.findOne({ where: { name: chatroomName } });
      if (!chatroom) {
        chatroom = await ChatRoom.create({
          name: chatroomName,
          description: "Private Chatroom",
          type: "private",
        });
        await chatroom.addUsers([user.id, recipientId]); // Add both users to the chatroom
      }

      socket.join(chatroom.id);
      socket.emit(
        "message",
        `Joined private chat with user ${recipient.companyName}`
      );
    } catch (error) {
      console.error("Error joining private room:", error);
      socket.emit(
        "error",
        "An error occurred while trying to join the private chatroom."
      );
    }
  });

  socket.on("createGroupChat", async ({ roomName, description }) => {
    try {
      const user = socket.user;
      const chatroom = await ChatRoom.create({
        name: roomName,
        description,
        type: "public",
      });
      await chatroom.addUser(user.id);

      socket.join(chatroom.id);
      socket.emit("message", `Created and joined groupchat: ${roomName}`);
      io.emit(
        "message",
        `${user.companyName} has created a new group chat: ${roomName}`
      );
    } catch (err) {
      console.log("Error creating groupchat: ", err);
      socket.emit(
        "error",
        "An error occured while creating the group chat: " + err
      );
    }
  });

  socket.on("joinGroupRoom", async ({ roomId }) => {
    try {
      const user = socket.user;
      const chatroom = await ChatRoom.findByPk(roomId);
      if (!chatroom) {
        socket.emit("error", "Chatroom does not exist");
        console.log("Chatroom does not exist");
        return;
      }
      await chatroom.addUser(user.id);

      socket.join(chatroom.id);
      socket.emit("message", `Joined group chat: ${chatroom.name}`);
      io.to(chatroom.id).emit(
        "message",
        `${user.companyName} has joined the chat`
      );
    } catch (err) {
      console.err("Error joining group room", err);
      socket.emit(
        "error",
        "An error occured when trying to join the group chatroom"
      );
    }
  });

  socket.on("sendMessage", async ({ roomId, message, recipientId }) => {
    const user = socket.user;
    try {
      const chatroom = await ChatRoom.findByPk(roomId, {
        include: [{ model: User, as: "users", where: { id: user.id } }],
      });
      // console.log(chatroom);
      if (chatroom) {
        const blockedChatRoom = await UserChatRoom.findOne({
          where: {
            [Op.or]: [
              { userId: user.id, chatRoomId: roomId, blocked: true },
              { userId: recipientId, chatRoomId: roomId, blocked: true },
            ],
          },
        });
        if (!blockedChatRoom) {
          const newMessage = await Messages.create({
            userId: user.id,
            chatRoomId: roomId,
            message: message,
          });
          io.to(roomId).emit("message", {
            from: user.companyName,
            message: message,
          });
        } else {
          socket.emit(
            "error",
            "Conversation between u and the user has been blocked"
          );
        }
      } else {
        socket.emit("error", "You are not a member of this chatroom");
      }
    } catch (err) {
      console.error("Error sending message: ", err);
      socket.emit("error", "There was an error sending the message: " + err);
    }
  });

  socket.on("deleteMessages", async ({ messageId }) => {
    try {
      const message = await Messages.findByPk(messageId);
      if (message) {
        message.isDeleted = true;
        await message.save();

        io.to(message.chatRoomId).emit("messageDeleted", {
          messageId: messageId,
          userId: message.userId,
        });

        socket.emit("message", "Message Deleted successfully");
      } else {
        socket.emit("error", "Message not found");
      }
    } catch (err) {
      console.error("Error deleting message: ", err);
      socket.emit("error", "Error deleting message");
    }
  });
}

module.exports = messageRoutes;

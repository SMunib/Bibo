const UserChatRoom = require("../models/UserChatRoom");

async function handleBlockedUsers(io, socket) {
  socket.on("blockUser", async ({ chatRoomId, blockedUserId }) => {
    try {
      const userChatRoom = await UserChatRoom.findOne({
        where: { userId: blockedUserId, chatRoomId },
      });
      if (userChatRoom) {
        userChatRoom.blocked = true;
        await userChatRoom.save();
        socket.emit("blockStatus", "User blocked Successfully");
      } else {
        socket.emit("error", "Chat room not found");
      }
    } catch (error) {
      console.error("error blocking user: ", error);
      socket.emit("error", "Error blocking user: " + error);
    }
  });

  socket.on("unblockUser", async ({ chatRoomId, blockedUserId }) => {
    try {
      const userChatRoom = await UserChatRoom.findOne({
        where: { userId: blockedUserId, chatRoomId },
      });
      if (userChatRoom) {
        userChatRoom.blocked = false;
        await userChatRoom.save();
        socket.emit("blockStatus", "User unblocked Successfully");
      } else {
        socket.emit("error", "Chat room not found");
      }
    } catch (error) {
      console.error("error blocking user: ", error);
      socket.emit("error", "Error blocking user: " + error);
    }
  });
}

module.exports = handleBlockedUsers;

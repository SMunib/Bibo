const chatRoutes = require("./chat");
const chatHistoryRoutes = require("./chatHistory");
const messageRoutes = require("./messages");
const blockedUsers = require("./blockedUsers");

async function setupSocketRoutes(io) {
  io.on("connection", (socket) => {
    chatRoutes(io, socket);
    messageRoutes(io, socket);
    chatHistoryRoutes(io, socket);
    blockedUsers(io, socket);
  });
}

module.exports = setupSocketRoutes;

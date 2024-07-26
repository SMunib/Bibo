const jwt = require("jsonwebtoken");
const key = process.env.jwtSecretKey;
const Token = require("../models/tokens");

async function authenticateSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers["x-auth-token"];
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const tokenRecord = await Token.findOne({ where: { key: token } });
    if (!tokenRecord) {
      return next(new Error("Authentication error: Invalid token"));
    }
    jwt.verify(token, key, (err, decoded) => {
      if (err) {
        return next(new Error(err));
      }
      socket.user = decoded;
      next();
    });
  } catch (err) {
    next(
      new Error("Authentication error: An error occurred during authentication")
    );
  }
}

module.exports = authenticateSocket;

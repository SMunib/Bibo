const jwt = require("jsonwebtoken");
const key = process.env.JWT_SECRET_KEY;

async function verifyToken(req, res, next) {
  // console.log(req, "under verify");
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied, token not provided");

  try {
    const decoded = jwt.verify(token, key);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid Token");
  }
}

module.exports = verifyToken;

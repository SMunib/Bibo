const jwt = require("jsonwebtoken");
const key = process.env.jwtSecretKey;
const Token = require('../models/tokens');

async function verifyToken(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied, token not provided");
  //en); console.log(tok
  try {
    const decoded = jwt.verify(token, key);
    const tokenRecord = await Token.findOne({where: {key: token}});
    if(!tokenRecord) return res.status(401).send('Invalid Token');
    req.user = decoded;
    // console.log(req.user);
    next();
  } catch (ex) {
    res.status(400).send("Invalid Token");
  }
}

module.exports = verifyToken;

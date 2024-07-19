const express = require("express");
const router = express.Router();
const Token = require("../models/tokens");

router.route("/resetpassword/:id/:token").get(async (req, res) => {
  const { id, token } = req.params;
  const checkToken = await Token.findOne({
    where: {
      userId: id,
      key: token,
    },
  });
  if (!checkToken) {
    req.flash("error", "Invalid Link");
    return res.redirect("/invalidLink");
  }
  res.render("reset-password", { id, token });
});

router.route("/").get(async (req, res) => {
  res.render("login");
});

router.get("/invalidLink", (req, res) => {
  res.render("invalidLink");
});

router.route("/resetpassword/success").get(async (req, res) => {
  res.render("successfulreset", { messages: req.flash() });
});
router.route("/home").get(async (req, res) => {
  res.render("home");
});
router.route("/signup").get(async (req, res) => {
  res.render("signup");
});
router.route("/forgetpassword").get(async (req, res) => {
  res.render("forgetpassword");
});
router.route("/verifyotp/:id").get(async (req, res) => {
  const userId = req.params.id;
  res.render("otpverify", { userId });
});
router.route("/verifyotp").get(async (req, res) => {
  res.render("otpverifypass");
});

module.exports = router;

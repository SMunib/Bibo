const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validate = require("../validators/login").validate;
const User = require("../models/user");
const _ = require("lodash");
const { Op } = require("sequelize");
const verify = require("../middleware/auth");
const validPass = require("../validators/password");

router.route("/").post(async (req, res) => {
  try {
    const { error } = await validate(req.body);
    if (error) return res.status(400).send(error);
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: req.body.email || null },
          { number: req.body.number || null },
        ],
      },
    });
    if (!user) {
      req.flash("error", "Email or phone number does not exist");
      return res.redirect("back");
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      res.flash("error", "Passwords do not match ");
      return res.redirect("back");
    }

    if (user.verified === false) {
      req.flash(
        "error",
        "Complete account verification before logging in......"
      );
      return res.redirect("otpverify");
    }

    const token = await user.generateToken();
    res.header("x-auth-token", token).send(_.pick(user, ["id", "companyName"]));
    req.flash("success", "Log-in Successful!");
    return res.redirect("home");
  } catch (err) {
    req.flash("error", "unexpected error!" + err);
    return res.redirect("back");
  }
});

router.route("/changePassword").post(verify, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const check = await validPass({ oldPassword, newPassword });
  if (check.success !== true) {
    req.flash("error", "Password should at least be of length 6");
    return res.redirect("back");
  }
  if (newPassword !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("back");
  }
  const user = await User.findByPk(req.id);
  if (!user) return res.status(400).send("Error, user not found");

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(newPassword, salt);

  const updation = await user.update({ password: hashedpassword });
  if (!updation) return res.status(400).send("Updation has failed");
  req.flash("success", "Password Changed Successfully!");
  return res.redirect("back");
});

module.exports = router;

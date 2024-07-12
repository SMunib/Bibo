const express = require("express");
const router = express.Router();
const validate = require("../validators/signup").validate;
const validPass = require("../validators/password");
const User = require("../models/user");
const Token = require("../models/tokens");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const generateOtp = require('../utils/generateOtp');
const { sequelize } = require("../startup/db");
const { transporter } = require("../utils/mailer");


router.route("/").post(async (req, res) => {
  const { error } = await validate(req.body);
  if (error) return res.status(400).send(error);
  const { email, password, confirmPassword, ...otherData } = req.body;

  try {
    const checkUser = await User.findOne({ where: { email } });
    if (checkUser) return res.status(400).send("User already registered");

    if (password !== confirmPassword)
      return res.status(400).send("Password does not match");

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    delete req.session.otp;
    delete req.session.expirationTime; 

    const {otp, expirationTime} = generateOtp();

    req.session.signupDetails = {password:hashedpassword,...otherData};
    req.session.otp = otp;
    req.session.email = email;
    req.session.otpExpiration = expirationTime;

    // console.log(req.session.signupDetails);
    return res.status(201).send(otp);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.route("/forgetpassword").post(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) return res.status(400).send({ message: "User does not exist" });
    const secret = process.env.jwtSecret + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost:3000/resetpassword/${user.id}/${token}`;
    const transaction = await sequelize.transaction();
    try {
      await Token.destroy(
        {
          where: {
            userId: user.id,
          },
        },
        transaction
      );

      await Token.create(
        {
          key: token,
          userId: user.id,
          keyType: "reset",
        },
        transaction
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(400).send("Error" + err);
    }

    const emailOptions = {
      from: "munibur.rehman@eplanetglobal.com",
      to: user.email,
      subject: "Password Reset",
      html: `<p> Click <a href="${link}" here</a> to reset your password.</p>`,
    };

    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .send({ message: "Email sending failed", success: false });
      } else {
        console.log("Email Sent: " + info.response);
        return res.status(200).send({
          message: "Password reset link has been sent",
          success: true,
        });
      }
    });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Password Reset has failed", success: false });
  }
});

router.route("/resetPassword/:id/:token").post(async (req, res) => {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;
  const check = await validPass({ password });

  if (check.success !== true) {
    req.flash("error", "Password should at least be of length 6");
    return res.redirect("back");
  }

  const user = await User.findByPk(id);
  if (!user) return res.status(400).send("Invalid User");

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

  const secret = process.env.jwtSecret + user.password;
  try {
    const payload = jwt.verify(token, secret);
    if (!payload) return res.status(400).send("Verification failed");

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("back");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const updatedUser = user.update({ password: hashedpassword });
    if (!updatedUser) {
      req.flash("error", "Password reset failed");
      return res.redirect("back");
    }
    await Token.destroy({
      where: {
        userId: id,
      },
    });
    req.flash("success", "Success! Redirecting to home page.....");
    return res.redirect(`/resetpassword/success`);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

module.exports = router;

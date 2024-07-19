const express = require("express");
const router = express.Router();
const User = require("../models/user");
const generateOtp = require("../utils/generateOtp");
const Otp = require("../models/otp");
const { Sequelize } = require("sequelize");
const verifyToken = require("../middleware/auth");

router.route("/:id").post(async (req, res) => {
  const { otp } = req.body;
  const userId = req.params.id;
  try {
    const latestOtp = await Otp.findOne({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
    });
    if (!otp) return res.status(404).json({ message: "Otp not found" });
    if (new Date() > new Date(otp.expiresAt)) {
      return res
        .status(400)
        .json({ message: "OTP expired or invalid. Ask for a new otp" });
    }
    console.log(otp);
    console.log(latestOtp.otp);
    if (otp === latestOtp.otp) {
      const user = await User.findByPk(userId);
      if (!user) return res.status(400).send("User not found");
      const updated = await user.update({ accountVerified: true });
      if (!updated)
        return res.status(400).send("Account could not be verified");
      req.flash("success", "Account Verified");
      return res.redirect("/");
    } else {
      return res.status(400).json({ message: "Error validating OTP" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.route("/").post(verifyToken, async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;
  console.log(otp);
  console.log(userId);
  const token = req.header("x-auth-token");
  try {
    const latestOtp = await Otp.findOne({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
    });
    if (!otp) return res.status(404).json({ message: "Otp not found" });
    if (new Date() > new Date(otp.expiresAt)) {
      return res
        .status(400)
        .json({ message: "OTP expired or invalid. Ask for a new otp" });
    }
    if (otp === latestOtp.otp) {
      console.log("success");
      return res.redirect(`/resetpassword/${userId}/${token}`);
    } else {
      console.log("fail");
      req.flash("error", "Otp does not match");
      res.redirect("back");
    }
  } catch (err) {
    return res.status(500).send("error" + err);
  }
});

router.route("/resend/:id").post(async (req, res) => {
  try {
    const { otp, expirationTime } = generateOtp();
    const userId = req.params.id;

    const MAX_OTP_REQUESTS = 3;
    const TIME_FRAME_MS = 60 * 60 * 1000;
    const oneHourAgo = new Date(Date.now() - TIME_FRAME_MS);

    const otpCount = await Otp.count({
      where: {
        userId: userId,
        createdAt: {
          [Sequelize.Op.gt]: oneHourAgo,
        },
      },
    });

    if (otpCount >= MAX_OTP_REQUESTS) {
      return res
        .status(429)
        .json({ message: "Too many OTP requests. Try again later." });
    }
    await Otp.create({
      otp,
      expiresAt: expirationTime,
      status: "active",
      userId: userId,
    });
    return res.status(200).json({ message: "Otp sent", otp });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Otp sending failed" });
  }
});

module.exports = router;

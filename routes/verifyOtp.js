const express = require("express");
const router = express.Router();
const User = require("../models/user");
const generateOtp = require("../utils/generateOtp");

router.route("/").post(async (req, res) => {
  const { userOtp } = req.body;
  const storedEmail = req.session.email;
  const { ...otherData } = req.session.signupDetails;
  const storedOtp = req.session.otp;
  const otpExpiration = req.session.otpExpiration;

  try {
    if (!storedOtp || !otpExpiration || new Date() > new Date(otpExpiration)) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }
    if (userOtp === storedOtp) {
      const user = await User.create({
        email: storedEmail,
        ...otherData,
      });

      if (!user) {
        return res.status(400).json({ message: "Account creation failed" });
      }

      // Clean up session data after successful account creation
      delete req.session.otp;
      delete req.session.signupDetails;
      delete req.session.email;
      delete req.session.otpExpiration;

      return res.status(201).json({
        user,
        message: "Account created successfully",
      });
    } else {
      return res.status(400).json({ message: "Error validating OTP" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.route("/resend").post(async (req, res) => {
  const { email } = req.session.email;
  if (!email)
    return res.status(400).json({ message: "Email not found in session" });

  try {
    const { otp, expirationTime } = generateOtp();
    req.session.otp = otp;
    req.session.expirationTime = expirationTime;

    return res.status(200).json({ message: "Otp sent", otp });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Otp sending failed" });
  }
});

module.exports = router;

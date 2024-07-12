const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "786a0f001@smtp-brevo.com",
    pass: "X8ySL4W53FrvQdts"
  },
});

module.exports = { transporter};

const nodemailer = require("nodemailer");

require("dotenv").config();

const config = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: "maxus195@ukr.net",
    pass: process.env.IMAP_PASS,
  },
};

const transporter = nodemailer.createTransport(config);

const sendEmail = async (data) => {
  const email = { from: "maxus195@ukr.net", ...data };
  await transporter.sendMail(email);
  return true;
};

module.exports = sendEmail;

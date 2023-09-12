const nodemailer = require("nodemailer");

require("dotenv").config();

const config = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: "anna_kon@ukr.net",
    pass: process.env.IMAP_PASS,
  },
};

const transporter = nodemailer.createTransport(config);

const sendEmail = async (data) => {
  const email = { from: "anna_kon@ukr.net", ...data };
  await transporter.sendMail(email);
  return true;
};

module.exports = sendEmail;

const nodemailer = require("nodemailer");
require("dotenv").config();

const { GMAIL_PASS, GMAIL_NAME } = process.env;

const nodemailConfig = {
  pool: true,
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: GMAIL_NAME,
    pass: GMAIL_PASS,
  },
};

const transport = nodemailer.createTransport(nodemailConfig);

async function sendEmail(data) {
  const email = { ...data, from: GMAIL_NAME };
  await transport.sendMail(email);
  return true;
}

module.exports = sendEmail;

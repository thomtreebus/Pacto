const nodemailer = require("nodemailer");
const EmailVerificationCode = require('../models/EmailVerificationCode');
const cryptoRandomString = require('crypto-random-string');
const dotenv = require('dotenv');
dotenv.config();

// We are currently set up using nodemailer test account.
// We should create a dedicated account.

const createTransporter = async () => { 

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS
    },
  });
}

module.exports.handleVerification = async (email, id) => {
  const transporter = await createTransporter();
  const code = await cryptoRandomString.async({length: 63, type: 'url-safe'});
  const url = "localhost:8000/verify?code="+code;
  
  const mail = await transporter.sendMail({
    from: 'pacto.noreply@gmail.com', // sender address
    to: email, // list of receivers
    subject: "Verify your email ✔", // Subject line
    text: url, // plain text body
  });
  
  await EmailVerificationCode.create({ userId:id, code });
  console.log(mail.messageId)
}
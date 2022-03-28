const nodemailer = require("nodemailer");
const EmailVerificationCode = require('../models/EmailVerificationCode');
const cryptoRandomString = require('crypto-random-string');
const dotenv = require('dotenv');
dotenv.config();

const createTransporter = async () => { 

  return nodemailer.createTransport({
    host: `${process.env.SMTP_HOST}`,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });
}

module.exports.handleVerification = async (email, id) => {
  const transporter = await createTransporter();
  const code = await cryptoRandomString.async({length: 63, type: 'url-safe'});
  const url = `${process.env.DEPLOYED_URL}/verify?code=${code}`;
    
  const mail = await transporter.sendMail({
    from: `${process.env.EMAIL_AUTHOR}`, // sender address
    to: email, // list of receivers
    subject: "Verify your email ✔", // Subject line
    text: url, // plain text body
  });
  
  await EmailVerificationCode.create({ userId:id, code });
}
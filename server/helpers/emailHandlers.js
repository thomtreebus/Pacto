const nodemailer = require("nodemailer");
const EmailVerificationCode = require('../models/EmailVerificationCode');
const cryptoRandomString = require('crypto-random-string');

// We are currently set up using nodemailer test account.
// We should create a dedicated account.

const createTransporter = async () => { 
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports (from docs)
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass
    },
  });
}

module.exports.handleVerification = async (email, id) => {
  const transporter = await createTransporter();
  const code = await cryptoRandomString.async({length: 63, type: 'url-safe'});
  const url = "https://localhost:8000/verify?code="+code;
  
  const mail = await transporter.sendMail({
    from: '"Pacto" <pacto@example.com>', // sender address
    to: email, // list of receivers
    subject: "Verify your email ✔", // Subject line
    text: url, // plain text body
  });
  
  await EmailVerificationCode.create({ userId:id, code });
  console.log(mail.messageId)
}
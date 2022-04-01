const nodemailer = require("nodemailer");
const EmailVerificationCode = require('../models/EmailVerificationCode');
const cryptoRandomString = require('crypto-random-string');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Configure nodemailer by creating an SMTP Transport using the Email credentials
 * @returns an SMTP Transport
 */
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

/**
 * Generate an email verification code and send it to a given user's email address
 * to verify that they are a student.
 *  
 * @param email - email address the verification code needs to be sent to
 * @param id - The ID of the user that the email belongs to
 */
module.exports.handleVerification = async (email, id) => {
  const transporter = await createTransporter();
  // Generate a verification code
  const code = await cryptoRandomString.async({length: 63, type: 'url-safe'});
  const url = `${process.env.DEPLOYED_URL}/verify?code=${code}`;
  
  // Send verification code to user's email address
  const mail = await transporter.sendMail({
    from: `${process.env.EMAIL_AUTHOR}`, // sender address
    to: email, // list of receivers
    subject: "Verify your email ✔", // Subject line
    text: url, // plain text body
  });
  // Store the email verification code in the database
  await EmailVerificationCode.create({ userId:id, code });
}
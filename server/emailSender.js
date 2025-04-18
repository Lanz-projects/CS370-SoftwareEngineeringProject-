// emailSender.js
const nodemailer = require('nodemailer');
const User = require('./models/User-schema');
require('dotenv').config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email to a user by their UID.
 * @param {string} uid - User UID
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 */
async function sendToUser(uid, subject, text) {
  try {
    const user = await User.findOne({ uid });
    if (!user || !user.email) throw new Error('User email not found');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      text,
    });

    console.log(`📬 Email sent to ${user.email}`);
  } catch (err) {
    console.error(`❌ Email failed for UID ${uid}:`, err.message);
  }
}

module.exports = {
  sendToUser,
};

import nodemailer from 'nodemailer';

console.log('USER:', process.env.GMAIL_USER);
console.log('PASS:', process.env.GMAIL_PASS);

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

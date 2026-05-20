import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js';
import { sendMail } from '../utils/SendEmail.utils.js';
import otpGenerator from 'otp-generator';
import mongoose from 'mongoose';
import { EmailVerification } from '../models/emialVerification.js';
import { User } from '../models/users.models.js';

export const sendEmailVerificationOtp = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const { email } = req.body;

  console.log('Request to send email verification OTP for email:', email);

  if (!email || req.user.email !== email) {
    throw new ApiError(400, 'Invalid email address');
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  await EmailVerification.findOneAndUpdate(
    { _id: req.user._id },
    {
      otp: otp,
      emailVerificationOtpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes expiry for now
    },
    { upsert: true, new: true, session }
  );

  await sendMail({
    to: email,
    subject: 'Verify Your Email - HiKareers',
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <h2 style="color: #333;">Email Verification</h2>
        
        <p style="font-size: 16px; color: #555;">
          Welcome to <strong>HiKareers</strong>
        </p>

        <p style="font-size: 15px; color: #666;">
          Use the OTP below to verify your email address:
        </p>

        <div style="margin: 25px 0;">
          <span style="display: inline-block; background: #2563eb; color: #fff; font-size: 32px; letter-spacing: 6px; padding: 14px 28px; border-radius: 8px; font-weight: bold;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #777;">
          This OTP is valid for 5 minutes.
        </p>

        <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #999;">
          If you didn’t request this email, you can safely ignore it.
        </p>

      </div>
    </div>
  `,
  });

  res.status(200).json({
    success: true,
    message: `OTP sent to ${email}`,
  });
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) throw new ApiError(400, 'OTP not found');

  const record = await EmailVerification.findOne({ _id: req.user._id });
  if (!record)
    throw new ApiError(404, 'No OTP record found, please request a new OTP');

  if (record.otp !== otp || record.emailVerificationOtpExpiry < Date.now())
    throw new ApiError(400, 'Invalid or expired OTP');

  await User.findByIdAndUpdate(req.user._id, { emailVerified: true });
  await EmailVerification.deleteOne({ _id: req.user._id });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

import asyncHandler from "../utils/asyncHnadler.utils.js"; 
import ApiError from "../utils/ApiError.utils.js";
import { sendMail } from "../utils/sendEmail.utils.js";
import otpGenerator from "otp-generator";
import mongoose from "mongoose";
import { EmailVerification } from "../models/emialVerification.js";

export const sendEmailVerificationOtp = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const { email } = req.body;

  console.log("Request to send email verification OTP for email:", email);

  if (!email || req.user.email !== email) {
    throw new ApiError(400, "Invalid email address");
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

  await EmailVerification.findOneAndUpdate(
      { _id: req.user._id },
      {
        otp: otp,
        emailVerificationOtpExpiry: Date.now() + 5 * 60 * 1000  // 5 minutes expiry for now
      },
      { upsert: true, new: true, session }
    );

  await sendMail({
    to: email,
    subject: "Your Email Verification OTP",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`
  });

  res.status(200).json({
    success: true,
    message: `OTP sent to ${email}`
  });
});

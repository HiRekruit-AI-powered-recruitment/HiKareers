import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js';
import ApiResponse from '../utils/ApiResponse.utils.js';
import { User } from '../models/users.models.js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/SendEmail.utils.js';
import UploadImageToCloudinary from '../utils/UploadImageToCloudinary.js';
import crypto from 'crypto';

export const register = asyncHandler(async (req, res) => {
  const { email, fullName, password, userType } = req.body;
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  if (!email || !fullName || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({
    $or: [{ email }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  let profilePhoto = {
    imageUrl: null,
    publicId: null,
  };

  if (req.file) {
    const uploadedImage = await UploadImageToCloudinary(
      req.file.buffer,
      'user/profile-images',
      `user-${Date.now()}`
    );

    profilePhoto = {
      imageUrl: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  }
  const newUser = new User({
    email,
    fullName,
    password,
    profilePhoto,
    userType,
  });

  await newUser.save();

  const newRefreshToken = await newUser.generateRefreshToken();
  const accessToken = await newUser.generateAccessToken();

  newUser.refreshToken = newRefreshToken;
  await newUser.save();

  const createdUser = await User.findById(newUser._id).select(
    '-password -refreshToken'
  );

  try {
    await sendMail({
      to: email,
      subject: 'Welcome to HiKareers',
      html: `<!DOCTYPE html>
        <html>
        <body style="margin:0;padding:30px;background:#f5f7fa;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">
            <table width="520" cellpadding="0" cellspacing="0" border="0"
                    style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                <tr><td style="height:4px;background:#2563eb;"></td></tr>
                <tr>
                <td style="padding:40px 44px;">
                    <p style="margin:0 0 32px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">HiKareers</p>
                    <h1 style="margin:0 0 14px;color:#111;font-size:26px;font-weight:700;line-height:1.3;">Welcome! Find your next opportunity.</h1>
                    <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
                    We're glad you're here. Browse job listings matched to your skills and start applying today.
                    </p>
                    <a href="https://careers.hirekruit.com/jobs"
                    style="display:inline-block;padding:13px 30px;background:#2563eb;color:#fff;
                            text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                    Browse Jobs
                    </a>
                </td>
                </tr>
                <tr>
                <td style="padding:20px 44px;border-top:1px solid #f0f0f0;">
                    <p style="margin:0;color:#aaa;font-size:12px;">© 2025 HiKareers · All rights reserved</p>
                </td>
                </tr>
            </table>
            </td></tr>
        </table>
        </body>
        </html>`,
    });
  } catch (err) {
    console.log('Email failed:', err.message);
  }

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering user');
  }

  return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(new ApiResponse(201, 'User registered successfully', createdUser));
});

export const adminRegister = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!email || !fullName || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  let profilePhoto = { imageUrl: null, publicId: null };
  if (req.file) {
    const uploaded = await UploadImageToCloudinary(
      req.file.buffer,
      'user/profile-images',
      `user-${Date.now()}`
    );
    profilePhoto = {
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }

  const newAdmin = new User({
    email,
    fullName,
    password,
    profilePhoto,
    userType: 'admin',
    approvalStatus: 'pending',
  });

  await newAdmin.save();

  try {
    await sendMail({
      to: email,
      subject: 'Admin Registration Received – Pending Approval',
      html: `<!DOCTYPE html>
        <html>
        <body style="margin:0;padding:30px;background:#f5f7fa;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" border="0"
                 style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
            <tr><td style="height:4px;background:#d97706;"></td></tr>
            <tr>
              <td style="padding:40px 44px;">
                <p style="margin:0 0 32px;color:#d97706;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">HiKareers Admin</p>
                <h1 style="margin:0 0 14px;color:#111;font-size:26px;font-weight:700;">Registration Received</h1>
                <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                  Hi ${fullName}, your admin account request has been received.<br/>
                  Our team will review it shortly. You'll get another email once it's approved.
                </p>
                <p style="margin:0;color:#888;font-size:13px;">If you didn't request this, please ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 44px;border-top:1px solid #f0f0f0;">
                <p style="margin:0;color:#aaa;font-size:12px;">© 2025 HiKareers · All rights reserved</p>
              </td>
            </tr>
          </table>
          </td></tr>
        </table>
        </body>
        </html>`,
    });
  } catch (err) {
    console.log('Registrant email failed:', err.message);
  }

  return res.status(201).json(
    new ApiResponse(201, 'Admin registration submitted. Awaiting approval.', {
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      approvalStatus: newAdmin.approvalStatus,
    })
  );
});

export const login = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(userName || email)) {
    throw new ApiError(400, 'Username or email is required');
  }

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  const query = userName ? { userName } : { email };

  const user = await User.findOne(query);

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  if (user.userType === 'admin' && user.approvalStatus !== 'approved') {
    const msg =
      user.approvalStatus === 'pending'
        ? 'Your admin account is pending approval. You will be notified via email.'
        : 'Your admin account request was rejected. Please contact support.';
    throw new ApiError(403, msg);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, 'User logged in successfully', {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, 'User logged out successfully'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const accessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(200, 'Access token refreshed', {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(401, 'Email required');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetToken = hashedToken;

  user.passwordResetExpiry = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });
  const resetUrl = `https://careers.hirekruit.com/${resetToken}`;

  await sendMail({
    to: user.email,
    subject: 'Reset Password',
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Reset Password</title>
        </head>

        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding:40px 20px;">

                <table width="520" cellpadding="0" cellspacing="0" border="0"
                  style="background:#ffffff;border-radius:14px;overflow:hidden;
                  box-shadow:0 4px 18px rgba(0,0,0,0.08);">

                  
                  <tr>
                    <td style="height:5px;background:#2563eb;"></td>
                  </tr>

                  
                  <tr>
                    <td style="padding:40px;">

                      <p style="
                        margin:0 0 25px;
                        color:#2563eb;
                        font-size:13px;
                        font-weight:700;
                        letter-spacing:2px;
                        text-transform:uppercase;
                      ">
                        HiKareers
                      </p>

                      <h1 style="
                        margin:0 0 16px;
                        color:#111827;
                        font-size:28px;
                        font-weight:700;
                        line-height:1.3;
                      ">
                        Reset Your Password
                      </h1>

                      <p style="
                        margin:0 0 30px;
                        color:#4b5563;
                        font-size:15px;
                        line-height:1.8;
                      ">
                        We received a request to reset your password.
                        Click the button below to create a new password.
                        This link will expire in 10 minutes.
                      </p>

                      <a
                        href="${resetUrl}"
                        style="
                          display:inline-block;
                          padding:14px 32px;
                          background:#2563eb;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:8px;
                          font-size:15px;
                          font-weight:600;
                        "
                      >
                        Reset Password
                      </a>

                      <p style="
                        margin:35px 0 10px;
                        color:#6b7280;
                        font-size:14px;
                        line-height:1.7;
                      ">
                        If you didn’t request a password reset,
                        you can safely ignore this email.
                      </p>

                      <p style="
                        margin:0;
                        color:#9ca3af;
                        font-size:13px;
                      ">
                        For security reasons, this link will expire shortly.
                      </p>

                    </td>
                  </tr>

                  <tr>
                    <td style="
                      padding:20px 40px;
                      border-top:1px solid #e5e7eb;
                    ">
                      <p style="
                        margin:0;
                        color:#9ca3af;
                        font-size:12px;
                      ">
                        © 2026 HiKareers · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </body>
        </html>
        `,
  });

  return res.status(200).json(new ApiResponse(200, 'Reset link sent'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired token');
  }

  user.password = password;

  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Password reset successful'));
});

export const getAllAdmins = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { userType: 'admin' };
  if (status) filter.approvalStatus = status;

  const admins = await User.find(filter)
    .select('-password -refreshToken -passwordResetToken -passwordResetExpiry')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Admins fetched successfully', { admins }));
});

export const updateAdminApproval = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { id } = req.params;
  const { action } = req.body;

  if (!['approved', 'rejected'].includes(action)) {
    throw new ApiError(400, 'action must be "approved" or "rejected"');
  }

  const admin = await User.findOne({ _id: id, userType: 'admin' });
  if (!admin) throw new ApiError(404, 'Admin not found');

  admin.approvalStatus = action;
  await admin.save();

  const approved = action === 'approved';

  try {
    await sendMail({
      to: admin.email,
      subject: approved
        ? 'Your Admin Account Has Been Approved!'
        : 'Admin Account Request Update',
      html: `<!DOCTYPE html>
      <html>
      <body style="margin:0;padding:30px;background:#f5f7fa;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" border="0"
               style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
          <tr><td style="height:4px;background:${approved ? '#16a34a' : '#dc2626'};"></td></tr>
          <tr>
            <td style="padding:40px 44px;">
              <h1 style="margin:0 0 16px;color:#111;font-size:24px;font-weight:700;">
                ${approved ? "You're approved!" : 'Account Request Update'}
              </h1>
              <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.7;">
                ${
                  approved
                    ? `Hi ${admin.fullName}, your admin account is now active. You can log in to the HiKareers admin panel.`
                    : `Hi ${admin.fullName}, unfortunately your admin account request was not approved. Please contact support if you think this is a mistake.`
                }
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 44px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;color:#aaa;font-size:12px;">© 2025 HiKareers · All rights reserved</p>
            </td>
          </tr>
        </table>
        </td></tr>
      </table>
      </body>
      </html>`,
    });
  } catch (err) {
    console.log('Approval email failed:', err.message);
  }

  return res.status(200).json(
    new ApiResponse(200, `Admin ${action}d successfully`, {
      _id: admin._id,
      approvalStatus: admin.approvalStatus,
    })
  );
});

export const revokeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await User.findOne({ _id: id, userType: 'admin' });
  if (!admin) throw new ApiError(404, 'Admin not found');

  if (admin.approvalStatus !== 'approved') {
    throw new ApiError(400, 'Only approved admins can be revoked');
  }

  admin.approvalStatus = 'rejected';
  admin.refreshToken = undefined;
  await admin.save({ validateBeforeSave: false });

  try {
    await sendMail({
      to: admin.email,
      subject: 'Your Admin Access Has Been Revoked',
      html: `<!DOCTYPE html>
      <html>
      <body style="margin:0;padding:30px;background:#f5f7fa;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" border="0"
               style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
          <tr><td style="height:4px;background:#dc2626;"></td></tr>
          <tr>
            <td style="padding:40px 44px;">
              <h1 style="margin:0 0 16px;color:#111;font-size:24px;font-weight:700;">Admin Access Revoked</h1>
              <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.7;">
                Hi ${admin.fullName}, your admin access to HiKareers has been revoked.
                Please contact support if you believe this is a mistake.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 44px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;color:#aaa;font-size:12px;">© 2025 HiKareers · All rights reserved</p>
            </td>
          </tr>
        </table>
        </td></tr>
      </table>
      </body>
      </html>`,
    });
  } catch (err) {
    console.log('Revoke email failed:', err.message);
  }

  return res.status(200).json(
    new ApiResponse(200, 'Admin revoked successfully', {
      _id: admin._id,
      approvalStatus: admin.approvalStatus,
    })
  );
});

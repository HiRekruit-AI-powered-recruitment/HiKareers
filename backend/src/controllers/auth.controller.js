import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js';
import ApiResponse from '../utils/ApiResponse.utils.js';
import { User } from '../models/users.models.js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/SendEmail.utils.js';

export const register = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  if (!userName || !email || !fullName || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  const newUser = new User({ userName, email, fullName, password });
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
      subject: 'Welcome to HaiKareer',
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
                    <p style="margin:0 0 32px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">HaiKareer</p>
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
                    <p style="margin:0;color:#aaa;font-size:12px;">© 2025 HaiKareer · All rights reserved</p>
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

export const login = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  console.log('Logging in user:', userName || email);

  if (!(userName || email)) {
    throw new ApiError(400, 'Username or email is required');
  }

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, 'User does not exist');
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

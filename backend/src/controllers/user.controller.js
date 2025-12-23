import asyncHandler from "../utils/asyncHnadler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import { User } from "../models/users.models.js";
import UploadToCloudinary from "../utils/UploadToCloudinary.utils.js";
import cloudinary from '../config/cloudinary.js';


export const uploadUserResumes = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  const sequence = Number(req.body?.sequence);
  if (![1, 2, 3].includes(sequence)) {
    throw new ApiError(400, "Invalid resume sequence. Must be 1, 2, or 3");
  }

  const resumeFile = req.file;
  const slotKey = String(sequence);
  console.log(req.body)

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const result = await UploadToCloudinary(
      resumeFile.buffer,
      `user_resume/${user._id}`,
      slotKey
    );

    if (user.resumes?.[slotKey]?.publicId) {
      await cloudinary.uploader.destroy(user.resumes[slotKey].publicId, {
        resource_type: 'raw'
      });
    }
    user.resumes[slotKey] = {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: resumeFile.originalname,
      uploadedAt: new Date()
    };

  await user.save();

  // Recompute profile completion using model helper
  const profileCompleted = user.computeProfileCompleted ? user.computeProfileCompleted() : false;
  if (user.profileCompleted !== profileCompleted) {
    user.profileCompleted = profileCompleted;
    await user.save();
  }

  return res.status(200).json(
    new ApiResponse(200, "Resumes uploaded successfully", user.resumes)
  );
});



export const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("Current user:", req.user);
    return res
        .status(200)
        .json(new ApiResponse(200, "User fetched successfully", req.user));
});


export const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, email, mobile, highestQualification, qualifications } = req.body;

    if (!fullName && !email && !mobile && !highestQualification && !qualifications) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    // Prevent changing mobile once it's verified
    if (mobile && user.mobileVerified && mobile !== user.mobile) {
      throw new ApiError(400, 'Cannot change mobile once verified');
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (mobile) updateData.mobile = mobile;
    if (highestQualification) updateData.highestQualification = highestQualification;
    if (qualifications) updateData.qualifications = qualifications;
    
    if (email) {
        const existingUser = await User.findOne({ 
            email, 
            _id: { $ne: req.user._id } 
        });
        if (existingUser) {
            throw new ApiError(409, "Email already exists");
        }
        updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    // Recompute profile completion using model helper
    const profileCompleted = updatedUser.computeProfileCompleted ? updatedUser.computeProfileCompleted() : false;
    if (updatedUser.profileCompleted !== profileCompleted) {
      updatedUser.profileCompleted = profileCompleted;
      await updatedUser.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Profile updated successfully", updatedUser));
});


export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user._id);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully"));
});


export const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "User fetched successfully", user));
});


export const deleteUser = asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, "User account deleted successfully"));
});

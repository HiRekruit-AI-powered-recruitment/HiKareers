import asyncHandler from "../utils/asyncHnadler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import { User } from "../models/users.models.js";
import UploadToCloudinary from "../utils/UploadToCloudinary.utils.js";
import cloudinary from '../config/cloudinary.js';

export const uploadUserResumes = asyncHandler(async (req, res) => {
  const resumeFile = req.file || {};
  console.log(req.body)

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const result = await UploadToCloudinary(
      resumeFile.buffer,
      `user_resume/${user._id}/${req.body.sequence}`,
      req.body.sequence
    );

    if (user.resumes?.[req.body.sequence]?.publicId) {
      await cloudinary.uploader.destroy(user.resumes[req.body.sequence].publicId, {
        resource_type: 'raw'
      });
    }
    user.resumes[req.body.sequence] = {
      url: result.secure_url,
      publicId: result.public_id,
      // fileName: resumeFile.originalname,
      uploadedAt: new Date()
    };


  await user.save();

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

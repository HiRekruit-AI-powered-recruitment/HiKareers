import asyncHandler from "../utils/asyncHnadler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import { User } from "../models/users.models.js";


export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "User fetched successfully", req.user));
});


export const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
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

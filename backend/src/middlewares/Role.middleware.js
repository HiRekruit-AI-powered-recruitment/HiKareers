import asyncHandler from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";

/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 */
export const authorizeRole = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        if (!roles.includes(req.user.userType)) {
            throw new ApiError(403, "Forbidden: You do not have permission to perform this action");
        }

        next();
    });
};

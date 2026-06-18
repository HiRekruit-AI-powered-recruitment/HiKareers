import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js';

const verifyHR = asyncHandler(async (req, res, next) => {
  const loggedInUser = req.user;
  if (!loggedInUser) {
    throw new ApiError(
      403,
      'Forbidden',
      'You are not logged in ! Please login!'
    );
  }
  if (loggedInUser.userType === 'admin') next();
  else throw new ApiError(403, 'Forbidden', 'Admin privileges required');
});

export default verifyHR;

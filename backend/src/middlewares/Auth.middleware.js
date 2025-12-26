import asyncHandler from "../utils/asyncHnadler.utils.js"
import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.utils.js"
import { User } from "../models/users.models.js"


const verifyUser = asyncHandler(async (req, res, next) => {
    const accessToken = (req.header("Authorization")?.replace("Bearer ", "")) || req.cookies?.accessToken

    if(!accessToken){
        throw new ApiError(401, "Unauthorized Access", "accessToken not found", "verifyUser: auth.middleWare.js")
    }

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    
    if(!decodedToken){
        throw new ApiError(401, "Unauthorized Access", "accessToken has expired", "verifyUser: auth.middleWare.js")
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user)
        throw new ApiError(401, "User not found")

    req.user = user
    console.log("Verified user:", user);
    next()
})

export default verifyUser

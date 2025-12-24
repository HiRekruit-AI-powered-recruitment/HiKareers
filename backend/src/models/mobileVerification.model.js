import mongoose from "mongoose"
import User from "./users.models.js";   

const mobileVerificationSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const MobileVerification = mongoose.model('MobileVerification', mobileVerificationSchema);
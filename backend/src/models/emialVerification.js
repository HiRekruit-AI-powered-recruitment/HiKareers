import mongoose from "mongoose"

const emailVerificationSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    emailVerificationOtpExpiry: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

export const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);
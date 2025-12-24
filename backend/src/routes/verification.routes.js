import { Router } from "express";
import { sendEmailVerificationOtp } from "../controllers/verification.controller.js";
import { verifyEmailOtp } from "../controllers/verification.controller.js";
import verifyUser from "../middlewares/Auth.middleware.js";

const router = Router();

router.route("/send-email-verification-otp").post(verifyUser, sendEmailVerificationOtp);
router.route("/verify-email-otp").post(verifyUser, verifyEmailOtp);

export default router;
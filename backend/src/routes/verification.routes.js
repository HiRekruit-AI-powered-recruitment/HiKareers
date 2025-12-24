import { Router } from "express";
import { sendEmailVerificationOtp } from "../controllers/verification.controller.js";
import verifyUser from "../middlewares/Auth.middleware.js";

const router = Router();

router.route("/send-email-verification-otp").post(verifyUser, sendEmailVerificationOtp);

export default router;
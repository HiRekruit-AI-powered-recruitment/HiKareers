import { Router } from "express";
import {
    getCurrentUser,
    updateUserProfile,
    changePassword,
    getUserById,
    deleteUser
} from "../controllers/user.controller.js";
import verifyUser from "../middlewares/Auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyUser);

router.get("/me", getCurrentUser);
router.patch("/profile", updateUserProfile);
router.patch("/change-password", changePassword);
router.get("/:userId", getUserById);
router.delete("/delete-account", deleteUser);

export default router;

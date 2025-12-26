import { Router } from "express";
import {
    createApplication,
    updateApplication,
    withdrawApplication,
    getMyApplications,
    getApplicationById,
    getJobApplications,
    updateApplicationStatus,
    acceptApplication
} from "../controllers/application.controller.js";
import verifyUser from "../middlewares/Auth.middleware.js";
import { uploadResume, handleMulterError } from "../middlewares/multer.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyUser);

// User routes
router.post("/", createApplication);
router.get("/me", getMyApplications);
router.get("/:applicationId", getApplicationById);
router.patch("/:applicationId/resume", uploadResume, handleMulterError, updateApplication);
router.patch("/:applicationId/withdraw", withdrawApplication);
router.patch("/:applicationId/accept", acceptApplication);

// HR routes
router.get("/job/:jobId", getJobApplications);
router.patch("/:applicationId/status", updateApplicationStatus);

export default router;

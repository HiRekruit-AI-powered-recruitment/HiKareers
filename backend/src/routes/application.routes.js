import { Router } from "express";
import {
    createApplication,
    updateApplication,
    withdrawApplication,
    getMyApplications,
    getApplicationById,
    getAllApplications,
    getJobApplications,
    updateApplicationStatus,
    acceptApplication
} from "../controllers/application.controller.js";
import verifyUser from "../middlewares/Auth.middleware.js";
import { uploadResume, handleMulterError } from "../middlewares/Multer.middleware.js";
import { authorizeRole } from "../middlewares/Role.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyUser);

// User routes
router.post("/", uploadResume, handleMulterError, createApplication);
router.get("/me", getMyApplications);
router.get("/:applicationId", getApplicationById);
router.patch("/:applicationId/resume", uploadResume, handleMulterError, updateApplication);
router.patch("/:applicationId/withdraw", withdrawApplication);
router.patch("/:applicationId/accept", acceptApplication);

// Admin/HR routes
router.get("/", authorizeRole('admin'), getAllApplications);
router.get("/job/:jobId", authorizeRole('admin'), getJobApplications);
router.patch("/:applicationId/status", authorizeRole('admin'), updateApplicationStatus);


export default router;


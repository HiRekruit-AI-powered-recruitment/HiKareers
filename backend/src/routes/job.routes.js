import { Router } from "express";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, getAdminStats } from "../controllers/job.controller.js";
import verifyUser from "../middlewares/Auth.middleware.js";
import { authorizeRole } from "../middlewares/Role.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllJobs);
router.get("/:jobId", getJobById);

// Protected routes (require admin privileges)
router.post("/", verifyUser, authorizeRole('admin'), createJob);
router.get("/admin/stats", verifyUser, authorizeRole('admin'), getAdminStats);
router.put("/:jobId", verifyUser, authorizeRole('admin'), updateJob);
router.delete("/:jobId", verifyUser, authorizeRole('admin'), deleteJob);


export default router;

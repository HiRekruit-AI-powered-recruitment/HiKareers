import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAdminStats,
  getAllResumes,
  saveJob,
  removeSavedJob,
  getAllSavedJobs,
} from '../controllers/job.controller.js';
import verifyUser from '../middlewares/Auth.middleware.js';
import { authorizeRole } from '../middlewares/Role.middleware.js';

const router = Router();

/// Public routes
router.get('/', getAllJobs);

router.get('/get-saved-jobs', verifyUser, getAllSavedJobs);

router.post('/save-job/:jobId', verifyUser, saveJob);

router.post('/remove-job/:jobId', verifyUser, removeSavedJob);

// Admin routes
router.get('/admin/stats', verifyUser, authorizeRole('admin'), getAdminStats);

router.post('/', verifyUser, authorizeRole('admin'), createJob);

router.get(
  '/:jobId/resumes',
  verifyUser,
  authorizeRole('admin'),
  getAllResumes
);

router.put('/:jobId', verifyUser, authorizeRole('admin'), updateJob);

router.delete('/:jobId', verifyUser, authorizeRole('admin'), deleteJob);

// Dynamic route ALWAYS LAST
router.get('/:jobId', getJobById);
export default router;

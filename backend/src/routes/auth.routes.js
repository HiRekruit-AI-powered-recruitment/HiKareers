import { Router } from 'express';

import {
  register,
  login,
  logout,
  refreshAccessToken,
  forgetPassword,
  resetPassword,
  adminRegister,
  updateAdminApproval,
} from '../controllers/auth.controller.js';

import verifyUser from '../middlewares/Auth.middleware.js';

import { uploadProfilePhoto } from '../middlewares/Multer.middleware.js';

const router = Router();

// Public routes
router.post('/register', uploadProfilePhoto, register);
router.post('/admin/register', uploadProfilePhoto, adminRegister);

router.post('/login', login);
router.post('/admin/login', login);

router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', verifyUser, logout);

router.post('/forgot-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/admin/:id/approve', updateAdminApproval);

export default router;

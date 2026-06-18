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
  getAllAdmins,
  revokeAdmin,
} from '../controllers/auth.controller.js';

import verifyUser from '../middlewares/Auth.middleware.js';

import { uploadProfilePhoto } from '../middlewares/Multer.middleware.js';
import { authorizeRole } from '../middlewares/Role.middleware.js';
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

router.get('/admins', verifyUser, authorizeRole('super-admin'), getAllAdmins);
router.patch(
  '/admins/:id/approval',
  verifyUser,
  authorizeRole('super-admin'),
  updateAdminApproval
);
router.patch(
  '/admins/:id/revoke',
  verifyUser,
  authorizeRole('super-admin'),
  revokeAdmin
);

export default router;

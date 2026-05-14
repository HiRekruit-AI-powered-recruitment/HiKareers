import { Router } from 'express';

import {
  register,
  login,
  logout,
  refreshAccessToken,
} from '../controllers/auth.controller.js';

import verifyUser from '../middlewares/Auth.middleware.js';

import { uploadProfilePhoto } from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.post('/register', uploadProfilePhoto, register);

router.post('/login', login);

router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', verifyUser, logout);

export default router;

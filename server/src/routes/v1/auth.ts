import { Router } from 'express';
import { AuthController } from '../../controllers/authController';
import { auth } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

// Protected routes
router.post('/change-password', auth, AuthController.changePassword);

export default router; 
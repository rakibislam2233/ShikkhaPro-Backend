import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authValidations } from './auth.validations';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

// Registration route
router.post(
  '/register',
  validateRequest(authValidations.register),
  AuthController.register
);

router.post(
  '/verify-otp',
  validateRequest(authValidations.verifyOTP),
  AuthController.verifyOtp
);

// Login route
router.post(
  '/login',
  validateRequest(authValidations.login),
  AuthController.login
);

// Resend verification OTP
router.post(
  '/resend-otp',
  AuthController.resendOtp
);

// Forgot password
router.post(
  '/forgot-password',
  validateRequest(authValidations.forgotPassword),
  AuthController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  validateRequest(authValidations.resetPassword),
  AuthController.resetPassword
);

router.post(
  '/refresh-token',
  validateRequest(authValidations.refreshToken),
  AuthController.refreshToken
);

export const AuthRoutes = router;
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';

import { config } from '../../config';
import moment from 'moment';
import bcrypt from 'bcrypt';
import { User } from '../user/user.model';
import { IUser, UserStatus } from '../user/user.interface';
import AppError from '../../errors/AppErro';
import { TokenService } from '../token/token.services';
import { AuthService } from './auth.services';
import { OtpService } from '../otp/otp.services';

const validateUserStatus = (user: IUser) => {
  if (user?.status === UserStatus.Blocked) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User account is blocked.');
  } else if (user?.status === UserStatus.Inactive) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User account is inactive.');
  } else if (user?.status === UserStatus.Banned) {
    if (user?.banExpiresAt && user?.banExpiresAt > new Date()) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User account is banned.');
    }
  } else if (user?.status === UserStatus.Delete) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User account is deleted.');
  }
};

const register = catchAsync(async (req, res) => {
  if (req.body?.role === 'Admin' || req.body?.role === 'SuperAdmin') {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Unauthorized to create admin or super admin.'
    );
  }

  const result = await AuthService.createUser(req.body);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'User created successfully',
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid credentials.');
  }
  validateUserStatus(user);
  if (user.security?.lockUntil && user?.security?.lockUntil > new Date()) {
    const tokens = await TokenService.accessAndRefreshToken(user);
    const responseData = {
      lockTime: config.auth.lockTime,
      lockUntil: user.security.lockUntil,
      tokens,
    };
    sendResponse(res, {
      code: StatusCodes.OK,
      message: `Account locked for ${config.auth.lockTime} minutes due to too many failed attempts.`,
      data: responseData,
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    user.security.loginAttempts = (user?.security?.loginAttempts || 0) + 1;
    if (user.security.loginAttempts >= config.auth.maxLoginAttempts) {
      user.security.lockUntil = moment()
        .add(config.auth.lockTime, 'minutes')
        .toDate();
      await user.save();
      const tokens = await TokenService.accessAndRefreshToken(user);
      const responseData = {
        lockTime: config.auth.lockTime,
        lockUntil: user.security.lockUntil,
        tokens,
      };
      sendResponse(res, {
        code: StatusCodes.OK,
        message: `Account locked for ${config.auth.lockTime} minutes due to too many failed attempts.`,
        data: responseData,
      });
    }
    await user.save();
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid credentials.');
  }

  if (user.security.loginAttempts > 0) {
    user.security.loginAttempts = 0;
    user.security.lockUntil = undefined;
    await user.save();
  }

  if (user.status === UserStatus.Unverified) {
    await OtpService.createVerificationEmailOtp(user.email);
    const tokens = await TokenService.accessAndRefreshToken(user);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Email is not verified. Please verify your email.',
      data: tokens,
    });
    return;
  }
  const tokens = await TokenService.accessAndRefreshToken(user);
  // Set cookies for access and refresh tokens
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.environment === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  // Send response with tokens
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: { tokens },
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { email,otp } = req.body;
  const result = await AuthService.verifyOtp(email, otp);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'OTP verified successfully.',
    data: { result },
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.resendOtp(email);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'OTP sent successfully.',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password reset email sent successfully.',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword, mfaToken } = req.body;

  await User.findById(userId).select('+mfaSecret');

  const result = await AuthService.changePassword(
    userId,
    currentPassword,
    newPassword
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password changed successfully.',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email } = req.user;
  const { newPassword } = req.body;
  const result = await AuthService.resetPassword(email, newPassword);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password reset successfully.',
    data: { result },
  });
});

const logout = catchAsync(async (req, res) => {
  //get refresh token from cookies
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Refresh token is required.');
  }
  await AuthService.logout(refreshToken);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User logged out successfully.',
    data: {},
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Refresh token is required.');
  }
  const tokens = await AuthService.refreshAuth(refreshToken);
  res.cookie('accessToken', tokens.tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Refresh token retrieved successfully.',
    data: tokens,
  });
});

export const AuthController = {
  register,
  login,
  verifyOtp,
  resendOtp,
  logout,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};

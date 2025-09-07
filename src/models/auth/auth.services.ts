import { User } from '../user/user.model';
import bcrypt from 'bcrypt';
import { config } from '../../config';
import { TokenType } from '../token/token.interface';
import { OtpType } from '../otp/otp.interface';
import moment from 'moment';
import { Token } from '../token/token.model';
import AppError from '../../errors/AppErro';
import { IUser, UserStatus } from '../user/user.interface';
import { StatusCodes } from 'http-status-codes';
import { OtpService } from '../otp/otp.services';
import { TokenService } from '../token/token.services';
import { IRegisterData, IVerifyOtpData } from './auth.interface';

const createUser = async (userData: IRegisterData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User already exists.');
  }
  const newUserData: Partial<IUser> = {
    email: userData?.email,
    password: userData?.password,
    profile: {
      fullName: userData?.fullName,
    },
  };
  const user = await User.create(newUserData);
  const tokens = await TokenService.accessAndRefreshToken(user);
  return tokens;
};

const verifyOtp = async (payload: IVerifyOtpData) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  await OtpService.verifyOTP(
    user.email,
    payload.otp,
    user.isResetPassword ? OtpType.RESET_PASSWORD : OtpType.VERIFY
  );
  user.status = UserStatus.Active;
  user.isResetPassword = false;
  await user.save();
  const tokens = await TokenService.accessAndRefreshToken(user);
  return { tokens };
};
const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  await OtpService.createResetPasswordOtp(user.email);
  user.isResetPassword = true;
  await user.save();
  const tokens = await TokenService.accessAndRefreshToken(user);
  return tokens;
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (user.isResetPassword) {
    const resetPasswordToken = await TokenService.createResetPasswordToken(
      user
    );
    await OtpService.createResetPasswordOtp(user.email);
    return { resetPasswordToken };
  }
  await OtpService.createVerificationEmailOtp(user.email);
  const tokens = await TokenService.accessAndRefreshToken(user);
  return tokens;
};

const resetPassword = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+passwordHistory');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  user.password = password;
  user.isResetPassword = false;
  await user.save();
  return null;
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select(
    '+password +passwordHistory +mfaSecret'
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (
    user.security.lastPasswordChange &&
    moment().diff(user.security.lastPasswordChange, 'hours') < 1
  ) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      'You can only change your password once per hour.'
    );
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid password.');
  }

  user.password = newPassword;
  user.security.lastPasswordChange = new Date();
  await user.save();
  return user;
};

const logout = async (refreshToken: string) => {
  const token = await Token.findOneAndDelete({
    token: refreshToken,
    type: TokenType.REFRESH,
  });
  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid refresh token.');
  }
};

const refreshAuth = async (refreshToken: string) => {
  const payload = await TokenService.verifyToken(
    refreshToken,
    config.jwt.refreshSecret,
    TokenType.REFRESH
  );
  const user = await User.findById(payload?.userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  await Token.deleteOne({ token: refreshToken, type: TokenType.REFRESH });
  const tokens = await TokenService.accessAndRefreshToken(user);

  return { tokens };
};

export const AuthService = {
  createUser,
  verifyOtp,
  resetPassword,
  forgotPassword,
  resendOtp,
  logout,
  changePassword,
  refreshAuth,
};

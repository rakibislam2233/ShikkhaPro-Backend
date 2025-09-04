import { emailService } from './../emailService/emailService';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import OTP from './otp.model';
import { config } from '../../config';
import AppError from '../../errors/AppErro';

const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const createOTP = async (
  userEmail: string,
  expiresInMinutes: string,
  type: string
) => {
  const lastOtp = await OTP.findOne({ userEmail, type }).sort({
    createdAt: -1,
  });
  if (lastOtp && moment().diff(lastOtp.createdAt, 'seconds') < 60) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Please wait 1 minute before requesting a new OTP.'
    );
  }

  const existingOTP = await OTP.findOne({
    userEmail,
    type,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingOTP) {
    const windowStart = moment()
      .subtract(config.otp.attemptWindowMinutes, 'minutes')
      .toDate();
    if (
      existingOTP.attempts >= config.otp.maxOtpAttempts &&
      existingOTP.lastAttemptAt &&
      existingOTP.lastAttemptAt > windowStart
    ) {
      throw new AppError(
        StatusCodes.TOO_MANY_REQUESTS,
        `Too many attempts. Try again after ${config.otp.attemptWindowMinutes} minutes.`
      );
    }
  }

  const otp = generateOTP();
  const otpDoc = await OTP.create({
    userEmail,
    otp,
    type,
    expiresAt: moment.utc().add(parseInt(expiresInMinutes), 'minutes').toDate(),
  });
  return otpDoc;
};

const verifyOTP = async (userEmail: string, otp: string, type: string) => {
  const otpDoc = await OTP.findOne({
    userEmail,
    otp,
    type,
    verified: false,
  });
  if (!otpDoc) {
    throw new AppError(StatusCodes.NOT_FOUND, 'OTP not found.');
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new AppError(StatusCodes.NOT_FOUND, 'OTP expired.');
  }

  otpDoc.attempts += 1;
  otpDoc.lastAttemptAt = new Date();

  if (otpDoc.attempts > config.otp.maxOtpAttempts) {
    await otpDoc.save();
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many attempts. Try again after ${config.otp.attemptWindowMinutes} minutes.`
    );
  }

  if (otpDoc.otp !== otp) {
    await otpDoc.save();
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP.');
  }

  otpDoc.verified = true;
  await otpDoc.save();
  return true;
};

const createVerificationEmailOtp = async (email: string) => {
  const otpDoc = await createOTP(
    email,
    config.otp.otpExpiration.toString(),
    'verify'
  );
  await emailService.sendVerificationEmail(email, otpDoc.otp);
  return otpDoc;
};

const createResetPasswordOtp = async (email: string) => {
  const otpDoc = await createOTP(
    email,
    config.otp.otpExpiration.toString(),
    'resetPassword'
  );
  await emailService.sendResetPasswordEmail(email, otpDoc.otp);
  return otpDoc;
};

const createLoginMfaOtp = async (email: string) => {
  const otpDoc = await createOTP(
    email,
    config.otp.otpExpiration.toString(),
    'loginMfa'
  );
  await emailService.sendLoginVerificationEmail(email, otpDoc?.otp);
  return otpDoc;
};

export const OtpService = {
  createOTP,
  verifyOTP,
  createVerificationEmailOtp,
  createResetPasswordOtp,
  createLoginMfaOtp,
};

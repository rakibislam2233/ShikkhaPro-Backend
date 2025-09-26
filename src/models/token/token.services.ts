import { StatusCodes } from 'http-status-codes';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import { Token } from './token.model';
import { TokenType } from './token.interface';
import { addMinutes, addDays } from 'date-fns';
import AppError from '../../errors/AppErro';
import { IUser } from '../user/user.interface';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}
const getExpirationTime = (expiration: string) => {
  const timeValue = parseInt(expiration);
  if (expiration.includes('d')) {
    return addDays(new Date(), timeValue);
  } else if (expiration.includes('m')) {
    return addMinutes(new Date(), timeValue);
  }
  return new Date();
};

const generateToken = (payload: object, secret: Secret, expireTime: string): string => {
  return jwt.sign(payload, secret as string, { expiresIn: expireTime } as SignOptions);
};

const saveToken = async (
  token: string,
  userId: string,
  type: string,
  expiresAt: Date
) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    type,
    expiresAt,
  });
  return tokenDoc;
};

const verifyToken = async (
  token: string,
  secret: Secret,
  type: string
): Promise<TokenPayload | null> => {
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    const tokenDoc = await Token.findOne({
      token,
      type,
      user: payload.userId,
    });
    if (!tokenDoc) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token.');
    }
    return payload;
  } catch (error) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }
};

const accessAndRefreshToken = async (user: IUser) => {
  const accessTokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user?.role,
  };

  const accessToken = generateToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.accessExpiration
  );

  const accessTokenExpires = getExpirationTime(config.jwt.accessExpiration);
  await saveToken(
    accessToken,
    user._id.toString(),
    TokenType.ACCESS,
    accessTokenExpires
  );

  const refreshTokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const refreshToken = generateToken(
    refreshTokenPayload,
    config.jwt.refreshSecret as Secret,
    config.jwt.refreshExpiration
  );

  const refreshTokenExpires = getExpirationTime(config.jwt.refreshExpiration);

  await saveToken(
    refreshToken,
    user._id.toString(),
    TokenType.REFRESH,
    refreshTokenExpires
  );

  return { accessToken, refreshToken };
};

const createResetPasswordToken = async (user: IUser) => {
  const resetPasswordTokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const resetPasswordToken = generateToken(
    resetPasswordTokenPayload,
    config.token.TokenSecret as Secret,
    config.token.resetPasswordTokenExpiration
  );

  const resetPasswordExpires = getExpirationTime(
    config.token.resetPasswordTokenExpiration
  );

  await saveToken(
    resetPasswordToken,
    user._id.toString(),
    TokenType.RESET_PASSWORD,
    resetPasswordExpires
  );

  return resetPasswordToken;
};

export const TokenService = {
  generateToken,
  saveToken,
  verifyToken,
  accessAndRefreshToken,
  createResetPasswordToken,
};

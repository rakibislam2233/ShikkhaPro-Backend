import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import { roleRights } from './roles';
import catchAsync from '../shared/catchAsync';
import AppError from '../errors/AppErro';
import { TokenService } from '../models/token/token.services';
import { config } from '../config';
import { TokenType } from '../models/token/token.interface';
import { User } from '../models/user/user.model';
import { UserStatus } from '../models/user/user.interface';

const auth = (...roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tokenWithBearer = req.headers.authorization;
    if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized to access');
    }

    const token = tokenWithBearer.split(' ')[1];
    const verifyUser = await TokenService.verifyToken(
      token,
      config.jwt.accessSecret as Secret,
      TokenType.ACCESS
    );

    if (verifyUser) {
      req.user = verifyUser;
    } else {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token.');
    }

    const user = await User.findById(verifyUser.userId);
    if (user?.status === UserStatus.Blocked) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Your account has been blocked. Please contact support.'
      );
    } else if (user?.status === UserStatus.Inactive) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Your account is inactive. Please contact support.'
      );
    } else if (user?.status === UserStatus.Banned) {
      if (user?.banExpiresAt && user?.banExpiresAt > new Date()) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'Your account has been banned. Please contact support.'
        );
      }
    } else if (user?.status === UserStatus.Delete) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Your account has been deleted. Please contact support.'
      );
    }
    if (roles.length) {
      const userRole = roleRights.get(verifyUser?.role);
      const hasRole = userRole?.some(role => roles.includes(role));
      if (!hasRole) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this API."
        );
      }
    }
    next();
  });

export default auth;

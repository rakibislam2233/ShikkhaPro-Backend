// src/middlewares/notFound.ts
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../shared/sendResponse';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const message = `The requested endpoint ${req.originalUrl} was not found`;

  sendResponse(res, {
    code: StatusCodes.NOT_FOUND,
    message,
    data: null,
  });
};

export default notFound;

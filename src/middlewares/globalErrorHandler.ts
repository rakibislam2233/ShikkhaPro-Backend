// src/middlewares/globalErrorHandler.ts
import { ErrorRequestHandler } from 'express';
import handleDuplicateError from '../errors/handleDuplicateError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import { errorLogger } from '../shared/logger';
import { IErrorMessage } from '../types/errors.types';
import { config } from '../config';
import multer from 'multer';
import AppError, {
  AuthError,
  ExternalServiceError,
  RateLimitError,
} from '../errors/AppErro';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // Log error with context
  config.environment === 'development'
    ? console.log('🚨 globalErrorHandler ~~', {
        error,
        method: req.method,
        url: req.url,
        userId: req.params.userId,
      })
    : errorLogger.error('🚨 globalErrorHandler ~~', {
        error,
        method: req.method,
        url: req.url,
        userId: req.params.userId,
      });

  let code = 500;
  let message = 'Something went wrong';
  let errorMessages: IErrorMessage[] = [];

  // Handle specific error types
  if (error.name === 'ZodError') {
    const simplifiedError = handleZodError(error);
    code = simplifiedError.code;
    errorMessages = simplifiedError.errorMessages;
  } else if (error.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    code = simplifiedError.code;
    errorMessages = simplifiedError.errorMessages;
  } else if (
    error.name === 'DuplicateError' ||
    (error.name === 'MongoServerError' && error.code === 11000)
  ) {
    const simplifiedError = handleDuplicateError(error);
    code = simplifiedError.code;
    errorMessages = simplifiedError.errorMessages;
  } else if (error.name === 'MongoServerError') {
    if (error.code === 121) {
      code = 400;
      message = 'Document validation failed';
      errorMessages = [{ path: '', message }];
    } else {
      code = 500;
      message = 'Database error';
      errorMessages = [{ path: '', message: error.message || message }];
    }
  } else if (error instanceof AuthError) {
    code = error.code; // 401 or 403
    message = error.message;
    errorMessages = [{ path: '', message: error.message }];
  } else if (error instanceof RateLimitError) {
    code = error.code; // 429
    message = error.message;
    errorMessages = [{ path: '', message: error.message }];
  } else if (error instanceof ExternalServiceError) {
    code = error.code;
    message = error.message;
    errorMessages = [{ path: '', message: error.message }];
  } else if (error instanceof multer.MulterError) {
    code = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File size limit exceeded'
        : 'File upload error';
    errorMessages = [{ path: 'file', message }];
  } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
    code = 400;
    message = 'Invalid JSON format';
    errorMessages = [{ path: 'body', message }];
  } else if (
    error.name === 'MongoNetworkError' ||
    error.message.includes('ECONNREFUSED')
  ) {
    code = 503;
    message = 'Database connection failed';
    errorMessages = [{ path: '', message }];
  } else if (
    error.message.includes('timeout') ||
    error.name === 'TimeoutError'
  ) {
    code = 504;
    message = 'Request timed out';
    errorMessages = [{ path: '', message }];
  } else if (error instanceof AppError) {
    code = error.code;
    message = error.message || 'Something went wrong';
    errorMessages = [
      {
        path: error.name === 'NotFoundError' ? 'userId' : '',
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error.message || 'Internal Server Error';
    errorMessages = [{ path: '', message: error.message }];
  } else {
    errorLogger.error('Unknown error type:', error);
    message = 'Internal Server Error';
    errorMessages = [{ path: '', message }];
  }

  // Format message
  message =
    errorMessages.length > 0
      ? errorMessages.map(err => err.message).join(', ')
      : message;

  // Send response
  res.status(code).json({
    code,
    message,
    error: errorMessages.length > 0 ? errorMessages : undefined
  });
};

export default globalErrorHandler;

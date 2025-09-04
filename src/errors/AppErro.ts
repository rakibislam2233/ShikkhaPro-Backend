// src/errors/AppError.ts
export default class AppError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// src/errors/NotFoundError.ts
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

// src/errors/AuthError.ts
export class AuthError extends AppError {
  constructor(code: number, message: string) {
    super(code, message);
    this.name = 'AuthError';
  }
}

// src/errors/RateLimitError.ts
export class RateLimitError extends AppError {
  constructor(message: string) {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

// src/errors/ExternalServiceError.ts
export class ExternalServiceError extends AppError {
  constructor(code: number, message: string) {
    super(code, message);
    this.name = 'ExternalServiceError';
  }
}

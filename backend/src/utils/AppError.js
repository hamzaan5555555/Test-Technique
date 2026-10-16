export default class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, code = 'BAD_REQUEST', details) { return new AppError(msg, 400, code, details); }
  static unauthorized(msg, code = 'UNAUTHORIZED') { return new AppError(msg, 401, code); }
  static forbidden(msg, code = 'FORBIDDEN') { return new AppError(msg, 403, code); }
  static notFound(msg, code = 'NOT_FOUND') { return new AppError(msg, 404, code); }
  static conflict(msg, code = 'CONFLICT') { return new AppError(msg, 409, code); }
}
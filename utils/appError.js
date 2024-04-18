class AppError extends Error {
  constructor(message, statusCode, type) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // States that objects created out of AppError class are operational errors.
    this.type = type;
  }
}

module.exports = AppError;

class AppError extends Error {
  constructor(message, statusCode, type, redirectUrl) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // States that objects created out of AppError class are operational errors.
    this.type = type;
    this.redirectUrl = redirectUrl;
  }
}

module.exports = AppError;

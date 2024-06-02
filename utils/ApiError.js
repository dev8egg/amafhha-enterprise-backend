class ApiError extends Error {
  constructor(statusCode = 500, message = "Something went wrong", data, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
module.exports = ApiError;

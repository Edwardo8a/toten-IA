const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

module.exports = ValidationError;

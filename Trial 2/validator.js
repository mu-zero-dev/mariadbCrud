const { validationResult, body } = require('express-validator');

// Validation function to check if a field is not empty
function validateNotEmpty(field) {
  return body(field).notEmpty().withMessage(`${field} must not be empty`);
}

// Validation function to check if an email is valid
function validateEmail(field) {
  return body(field).isEmail().withMessage(`${field} must be a valid email address`);
}

// Validation function to check if a password meets the minimum length requirement
function validatePassword(field, minLength) {
  return body(field).isLength({ min: minLength }).withMessage(`${field} must be at least ${minLength} characters long`);
}

// Validation function to check if a number is within a specified range
function validateNumberRange(field, min, max) {
  return body(field).isInt({ min, max }).withMessage(`${field} must be between ${min} and ${max}`);
}

// Middleware function to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  validateNotEmpty,
  validateEmail,
  validatePassword,
  validateNumberRange,
  handleValidationErrors
};

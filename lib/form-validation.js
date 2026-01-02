/**
 * Form Validation Utilities
 *
 * Provides comprehensive validation functions for forms across the application.
 * Supports:
 * - Field-level validation
 * - Form-level validation
 * - Async validation
 * - Custom validators
 * - Error message formatting
 *
 * Usage:
 * import { validators, validateForm } from '@/lib/form-validation';
 *
 * const errors = validateForm(formData, {
 *   email: [validators.required, validators.email],
 *   password: [validators.required, validators.minLength(8)]
 * });
 */

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * Common validation patterns
 */
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-()]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
};

/**
 * Core validators
 */
export const validators = {
  /**
   * Check if value is required (not empty)
   */
  required: (value) => {
    const isValid =
      value !== null &&
      value !== undefined &&
      value !== "" &&
      (typeof value !== "string" || value.trim() !== "");

    return {
      valid: isValid,
      error: isValid ? undefined : "This field is required",
    };
  },

  /**
   * Validate email format
   */
  email: (value) => {
    if (!value) return { valid: true };
    const isValid = patterns.email.test(value);
    return {
      valid: isValid,
      error: isValid ? undefined : "Please enter a valid email address",
    };
  },

  /**
   * Validate minimum length
   */
  minLength: (min) => (value) => {
    if (!value) return { valid: true };
    const isValid = value.length >= min;
    return {
      valid: isValid,
      error: isValid ? undefined : `Must be at least ${min} characters`,
    };
  },

  /**
   * Validate maximum length
   */
  maxLength: (max) => (value) => {
    if (!value) return { valid: true };
    const isValid = value.length <= max;
    return {
      valid: isValid,
      error: isValid ? undefined : `Must be no more than ${max} characters`,
    };
  },

  /**
   * Validate minimum value (for numbers)
   */
  min: (min) => (value) => {
    if (value === null || value === undefined || value === "")
      return { valid: true };
    const numValue = Number(value);
    const isValid = !isNaN(numValue) && numValue >= min;
    return {
      valid: isValid,
      error: isValid ? undefined : `Must be at least ${min}`,
    };
  },

  /**
   * Validate maximum value (for numbers)
   */
  max: (max) => (value) => {
    if (value === null || value === undefined || value === "")
      return { valid: true };
    const numValue = Number(value);
    const isValid = !isNaN(numValue) && numValue <= max;
    return {
      valid: isValid,
      error: isValid ? undefined : `Must be no more than ${max}`,
    };
  },

  /**
   * Validate URL format
   */
  url: (value) => {
    if (!value) return { valid: true };
    const isValid = patterns.url.test(value);
    return {
      valid: isValid,
      error: isValid ? undefined : "Please enter a valid URL",
    };
  },

  /**
   * Validate phone number format
   */
  phone: (value) => {
    if (!value) return { valid: true };
    const isValid = patterns.phone.test(value) && value.length >= 10;
    return {
      valid: isValid,
      error: isValid ? undefined : "Please enter a valid phone number",
    };
  },

  /**
   * Validate that value matches another field (e.g., password confirmation)
   */
  matches: (fieldName, fieldValue) => (value) => {
    const isValid = value === fieldValue;
    return {
      valid: isValid,
      error: isValid ? undefined : `Must match ${fieldName}`,
    };
  },

  /**
   * Validate alphanumeric characters only
   */
  alphanumeric: (value) => {
    if (!value) return { valid: true };
    const isValid = patterns.alphanumeric.test(value);
    return {
      valid: isValid,
      error: isValid ? undefined : "Only letters and numbers are allowed",
    };
  },

  /**
   * Validate against custom regex pattern
   */
  pattern:
    (regex, message = "Invalid format") =>
    (value) => {
      if (!value) return { valid: true };
      const isValid = regex.test(value);
      return {
        valid: isValid,
        error: isValid ? undefined : message,
      };
    },

  /**
   * Validate file size (in MB)
   */
  fileSize: (maxSizeMB) => (file) => {
    if (!file) return { valid: true };
    const sizeMB = file.size / (1024 * 1024);
    const isValid = sizeMB <= maxSizeMB;
    return {
      valid: isValid,
      error: isValid ? undefined : `File size must be less than ${maxSizeMB}MB`,
    };
  },

  /**
   * Validate file type
   */
  fileType: (allowedTypes) => (file) => {
    if (!file) return { valid: true };
    const isValid = allowedTypes.includes(file.type);
    return {
      valid: isValid,
      error: isValid
        ? undefined
        : `File type must be one of: ${allowedTypes.join(", ")}`,
    };
  },

  /**
   * Custom validator function
   */
  custom: (validatorFn, message) => (value) => {
    const isValid = validatorFn(value);
    return {
      valid: isValid,
      error: isValid ? undefined : message,
    };
  },
};

/**
 * Validate a single field with multiple validators
 *
 * @param {any} value - Field value to validate
 * @param {Array<Function>} validatorFns - Array of validator functions
 * @returns {ValidationResult} First validation error or success
 */
export function validateField(value, validatorFns = []) {
  for (const validator of validatorFns) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Validate entire form with field-specific validators
 *
 * @param {Object} formData - Form data object
 * @param {Object} schema - Validation schema { fieldName: [validators] }
 * @returns {Object} Errors object { fieldName: errorMessage }
 *
 * @example
 * const errors = validateForm(
 *   { email: 'test@example.com', password: '123' },
 *   {
 *     email: [validators.required, validators.email],
 *     password: [validators.required, validators.minLength(8)]
 *   }
 * );
 * // Returns: { password: 'Must be at least 8 characters' }
 */
export function validateForm(formData, schema) {
  const errors = {};

  for (const [fieldName, validatorFns] of Object.entries(schema)) {
    const value = formData[fieldName];
    const result = validateField(value, validatorFns);

    if (!result.valid) {
      errors[fieldName] = result.error;
    }
  }

  return errors;
}

/**
 * Check if form has any errors
 *
 * @param {Object} errors - Errors object from validateForm
 * @returns {boolean} True if there are errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

/**
 * Get first error message from errors object
 *
 * @param {Object} errors - Errors object
 * @returns {string|null} First error message or null
 */
export function getFirstError(errors) {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}

/**
 * Predefined validation schemas for common forms
 */
export const validationSchemas = {
  // Resume form validation
  resume: {
    fullName: [validators.required, validators.minLength(2)],
    email: [validators.required, validators.email],
    phone: [validators.phone],
    summary: [validators.required, validators.minLength(50)],
    skills: [validators.required],
  },

  // User profile validation
  profile: {
    firstName: [validators.required, validators.minLength(2)],
    lastName: [validators.required, validators.minLength(2)],
    email: [validators.required, validators.email],
    phone: [validators.phone],
    bio: [validators.maxLength(500)],
  },

  // Course creation validation
  course: {
    title: [
      validators.required,
      validators.minLength(5),
      validators.maxLength(100),
    ],
    category: [validators.required],
    difficulty: [validators.required],
    description: [validators.minLength(20), validators.maxLength(500)],
  },

  // Interview question validation
  interview: {
    question: [validators.required, validators.minLength(10)],
    expectedAnswer: [validators.minLength(20)],
  },
};

export default {
  validators,
  validateField,
  validateForm,
  hasErrors,
  getFirstError,
  validationSchemas,
};

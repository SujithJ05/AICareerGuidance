import { VALIDATION, FILE_SIZE_LIMITS } from "./constants";

/**
 * Validation utility functions
 */

export const validators = {
  required: (value) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return "This field is required";
    }
    return null;
  },

  email: (value) => {
    if (value && !VALIDATION.EMAIL.test(value)) {
      return "Invalid email address";
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  url: (value) => {
    if (value && !VALIDATION.URL.test(value)) {
      return "Invalid URL";
    }
    return null;
  },

  phone: (value) => {
    if (value && !VALIDATION.PHONE.test(value)) {
      return "Invalid phone number";
    }
    return null;
  },

  numeric: (value) => {
    if (value && isNaN(value)) {
      return "Must be a number";
    }
    return null;
  },

  integer: (value) => {
    if (value && (!Number.isInteger(Number(value)) || isNaN(value))) {
      return "Must be a whole number";
    }
    return null;
  },

  min: (min) => (value) => {
    if (value !== null && value !== undefined && Number(value) < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  max: (max) => (value) => {
    if (value !== null && value !== undefined && Number(value) > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || "Invalid format";
    }
    return null;
  },

  match: (fieldName, fieldLabel) => (value, allValues) => {
    if (value !== allValues[fieldName]) {
      return `Must match ${fieldLabel}`;
    }
    return null;
  },

  fileSize: (maxSize) => (file) => {
    if (file && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  },

  fileType: (allowedTypes) => (file) => {
    if (file) {
      const fileExt = "." + file.name.split(".").pop().toLowerCase();
      if (!allowedTypes.includes(fileExt)) {
        return `File type must be one of: ${allowedTypes.join(", ")}`;
      }
    }
    return null;
  },
};

/**
 * Compose multiple validators
 */
export function composeValidators(...validators) {
  return (value, allValues) => {
    for (const validator of validators) {
      const error = validator(value, allValues);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Validate an object against a schema
 */
export function validateSchema(data, schema) {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach((key) => {
    const validator = schema[key];
    const error = validator(data[key], data);

    if (error) {
      errors[key] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate resume file
 */
export function validateResumeFile(file) {
  const errors = [];

  const sizeError = validators.fileSize(FILE_SIZE_LIMITS.RESUME)(file);
  if (sizeError) errors.push(sizeError);

  const typeError = validators.fileType([".pdf", ".doc", ".docx"])(file);
  if (typeError) errors.push(typeError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

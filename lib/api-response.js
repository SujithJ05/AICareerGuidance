/**
 * API Response Utilities
 *
 * Standardized response formatting for all API endpoints.
 * Provides:
 * - Consistent response structure
 * - HTTP status code helpers
 * - Error response formatting
 * - Pagination helpers
 * - Type-safe response builders
 *
 * Usage:
 * import { apiResponse } from '@/lib/api-response';
 *
 * return apiResponse.success({ user }, 'User created successfully');
 * return apiResponse.error('User not found', 404);
 * return apiResponse.paginated(users, page, totalPages);
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Standard API response structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {any} [data] - Response data
 * @property {string} [message] - Success or error message
 * @property {string} [error] - Error message (for failed requests)
 * @property {Object} [meta] - Additional metadata (pagination, etc.)
 */

/**
 * HTTP Status Codes
 */
export const StatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Success response builder
 *
 * @param {any} data - Response data
 * @param {string} [message] - Success message
 * @param {number} [status] - HTTP status code (default: 200)
 * @returns {NextResponse}
 */
export function success(data = null, message = null, status = StatusCode.OK) {
  const response = {
    success: true,
    ...(data !== null && { data }),
    ...(message && { message }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Error response builder
 *
 * @param {string} error - Error message
 * @param {number} [status] - HTTP status code (default: 400)
 * @param {Object} [details] - Additional error details
 * @returns {NextResponse}
 */
export function error(error, status = StatusCode.BAD_REQUEST, details = null) {
  const response = {
    success: false,
    error,
    ...(details && { details }),
  };

  // Log server errors
  if (status >= 500) {
    logger.error("API Error:", { error, status, details });
  }

  return NextResponse.json(response, { status });
}

/**
 * Created response (201)
 *
 * @param {any} data - Created resource data
 * @param {string} [message] - Success message
 * @returns {NextResponse}
 */
export function created(data, message = "Resource created successfully") {
  return success(data, message, StatusCode.CREATED);
}

/**
 * No content response (204)
 *
 * @returns {NextResponse}
 */
export function noContent() {
  return new NextResponse(null, { status: StatusCode.NO_CONTENT });
}

/**
 * Validation error response (422)
 *
 * @param {Object} errors - Validation errors object
 * @param {string} [message] - Error message
 * @returns {NextResponse}
 */
export function validationError(errors, message = "Validation failed") {
  return error(message, StatusCode.UNPROCESSABLE_ENTITY, { errors });
}

/**
 * Unauthorized response (401)
 *
 * @param {string} [message] - Error message
 * @returns {NextResponse}
 */
export function unauthorized(message = "Unauthorized") {
  return error(message, StatusCode.UNAUTHORIZED);
}

/**
 * Forbidden response (403)
 *
 * @param {string} [message] - Error message
 * @returns {NextResponse}
 */
export function forbidden(message = "Forbidden") {
  return error(message, StatusCode.FORBIDDEN);
}

/**
 * Not found response (404)
 *
 * @param {string} [message] - Error message
 * @returns {NextResponse}
 */
export function notFound(message = "Resource not found") {
  return error(message, StatusCode.NOT_FOUND);
}

/**
 * Conflict response (409)
 *
 * @param {string} [message] - Error message
 * @returns {NextResponse}
 */
export function conflict(message = "Resource already exists") {
  return error(message, StatusCode.CONFLICT);
}

/**
 * Rate limit exceeded response (429)
 *
 * @param {string} [message] - Error message
 * @returns {NextResponse}
 */
export function rateLimited(message = "Too many requests") {
  return error(message, StatusCode.TOO_MANY_REQUESTS);
}

/**
 * Internal server error response (500)
 *
 * @param {string} [message] - Error message
 * @param {Error} [err] - Original error object
 * @returns {NextResponse}
 */
export function serverError(message = "Internal server error", err = null) {
  if (err) {
    logger.error("Server Error:", err);
  }

  return error(message, StatusCode.INTERNAL_SERVER_ERROR);
}

/**
 * Paginated response helper
 *
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total number of items
 * @param {number} [limit] - Items per page
 * @returns {NextResponse}
 */
export function paginated(data, page, totalPages, totalItems, limit = 10) {
  const response = {
    success: true,
    data,
    meta: {
      page,
      limit,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };

  return NextResponse.json(response, { status: StatusCode.OK });
}

/**
 * Calculate pagination parameters
 *
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {Object} Pagination parameters
 */
export function getPaginationParams(page = 1, limit = 10, totalItems = 0) {
  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.max(1, limit);
  const skip = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    skip,
    take: itemsPerPage,
    page: currentPage,
    totalPages,
    hasMore: currentPage < totalPages,
  };
}

/**
 * Handle async API route with error catching
 * Wraps route handler to catch errors and return standardized responses
 *
 * @param {Function} handler - Async route handler
 * @returns {Function} Wrapped handler
 *
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   const data = await fetchData();
 *   return apiResponse.success(data);
 * });
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      logger.error("API Route Error:", err);

      // Handle known error types
      if (err.name === "ValidationError") {
        return validationError(err.errors, err.message);
      }

      if (err.name === "UnauthorizedError") {
        return unauthorized(err.message);
      }

      if (err.name === "NotFoundError") {
        return notFound(err.message);
      }

      // Default to internal server error
      return serverError(
        process.env.NODE_ENV === "development"
          ? err.message
          : "An unexpected error occurred"
      );
    }
  };
}

/**
 * Unified API response object
 */
export const apiResponse = {
  success,
  error,
  created,
  noContent,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  rateLimited,
  serverError,
  paginated,
  getPaginationParams,
  withErrorHandler,
  StatusCode,
};

export default apiResponse;

/**
 * Toast Manager - Centralized notification system
 *
 * Provides consistent toast notifications across the application with:
 * - Type-safe toast variants (success, error, warning, info)
 * - Loading states with automatic dismissal
 * - Action buttons for user interaction
 * - Queue management for multiple toasts
 * - Accessibility support
 *
 * Usage:
 * import { toast } from '@/lib/toast-manager';
 *
 * toast.success('Course completed!');
 * toast.error('Failed to save resume');
 * toast.loading('Processing...', { id: 'upload' });
 * toast.dismiss('upload');
 */

import { toast as sonnerToast } from "sonner";

/**
 * Toast configuration defaults
 */
const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION = "top-right";

/**
 * Enhanced toast with success variant
 */
const success = (message, options = {}) => {
  return sonnerToast.success(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Enhanced toast with error variant
 */
const error = (message, options = {}) => {
  return sonnerToast.error(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Enhanced toast with warning variant
 */
const warning = (message, options = {}) => {
  return sonnerToast.warning(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Enhanced toast with info variant
 */
const info = (message, options = {}) => {
  return sonnerToast.info(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Loading toast with automatic dismissal
 * @param {string} message - Loading message
 * @param {Object} options - Toast options including id
 * @returns {string|number} Toast ID for later dismissal
 */
const loading = (message, options = {}) => {
  return sonnerToast.loading(message, options);
};

/**
 * Promise-based toast for async operations
 * Automatically shows loading, success, or error states
 *
 * @example
 * toast.promise(
 *   saveData(),
 *   {
 *     loading: 'Saving...',
 *     success: 'Data saved successfully!',
 *     error: 'Failed to save data'
 *   }
 * );
 */
const promise = (promiseFunction, messages, options = {}) => {
  return sonnerToast.promise(promiseFunction, messages, options);
};

/**
 * Custom toast with action button
 *
 * @example
 * toast.custom('Resume deleted', {
 *   action: {
 *     label: 'Undo',
 *     onClick: () => restoreResume()
 *   }
 * });
 */
const custom = (message, options = {}) => {
  return sonnerToast(message, options);
};

/**
 * Dismiss a specific toast by ID
 */
const dismiss = (toastId) => {
  sonnerToast.dismiss(toastId);
};

/**
 * Dismiss all active toasts
 */
const dismissAll = () => {
  sonnerToast.dismiss();
};

/**
 * Common toast messages for the application
 * Provides consistent messaging across features
 */
export const toastMessages = {
  // Course-related
  courseCreated: () => success("Course generated successfully!"),
  courseCompleted: () =>
    success("🎉 Congratulations on completing the course!"),
  courseFailed: (error) => error(`Failed to generate course: ${error}`),

  // Resume-related
  resumeSaved: () => success("Resume saved successfully!"),
  resumeDownloaded: () => success("Resume downloaded!"),
  resumeDeleted: () => success("Resume deleted"),
  resumeFailed: (error) => error(`Resume error: ${error}`),

  // Interview-related
  interviewCreated: () => success("Interview created successfully!"),
  interviewCompleted: () =>
    success("Interview completed! Check your feedback."),
  interviewFailed: (error) => error(`Interview error: ${error}`),

  // Certificate-related
  certificateEarned: () => success("🏆 Certificate earned!"),
  certificateDownloaded: () => success("Certificate downloaded!"),

  // Streak-related
  streakMilestone: (days) => success(`🔥 ${days} day streak! Keep going!`),
  streakLost: () => warning("Streak lost. Start a new one today!"),

  // Generic
  saveSuccess: () => success("Changes saved successfully!"),
  saveFailed: () => error("Failed to save changes"),
  copySuccess: () => success("Copied to clipboard!"),
  deleteSuccess: () => success("Deleted successfully!"),

  // Network/API
  networkError: () => error("Network error. Please check your connection."),
  unauthorized: () => error("Please sign in to continue"),
  serverError: () => error("Server error. Please try again later."),
};

/**
 * Unified toast interface
 */
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  custom,
  dismiss,
  dismissAll,
  ...toastMessages,
};

export default toast;

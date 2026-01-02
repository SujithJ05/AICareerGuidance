import { toast } from "sonner";

/**
 * Centralized notification utility
 */
export const notify = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || "Loading...",
      success: messages.success || "Success!",
      error: messages.error || "Something went wrong",
      ...options,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (
  error,
  fallbackMessage = "An error occurred"
) => {
  const message =
    error?.response?.data?.error || error?.message || fallbackMessage;
  notify.error(message);
  console.error("API Error:", error);
};

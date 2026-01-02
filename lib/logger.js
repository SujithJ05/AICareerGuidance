const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  error: (...args) => {
    if (isDevelopment) {
      console.error("[ERROR]", ...args);
    }
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn("[WARN]", ...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info("[INFO]", ...args);
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug("[DEBUG]", ...args);
    }
  },
};

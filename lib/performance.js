import { logger } from "./logger";

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(label) {
    this.metrics.set(label, performance.now());
  }

  endTimer(label, logWarning = true) {
    const start = this.metrics.get(label);
    if (!start) {
      logger.warn(`No timer started for: ${label}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.metrics.delete(label);

    if (logWarning && duration > 1000) {
      logger.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  async measureAsync(label, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      if (duration > 1000) {
        logger.warn(`${label} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`${label} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  measure(label, fn) {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;

      if (duration > 500) {
        logger.warn(`${label} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`${label} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
}

export const perfMonitor = new PerformanceMonitor();

export function withPerformanceTracking(fn, label) {
  return async function (...args) {
    return perfMonitor.measureAsync(label || fn.name, () => fn(...args));
  };
}

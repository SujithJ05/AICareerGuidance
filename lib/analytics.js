/**
 * Analytics and tracking utilities for user events
 * This provides a unified interface for tracking across different analytics platforms
 */

import { logger } from "./logger";

// Event types for type safety
export const EVENT_TYPES = {
  // User events
  USER_SIGNUP: "user_signup",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  ONBOARDING_COMPLETE: "onboarding_complete",

  // Resume events
  RESUME_CREATED: "resume_created",
  RESUME_UPDATED: "resume_updated",
  RESUME_DOWNLOADED: "resume_downloaded",
  ATS_CHECK_PERFORMED: "ats_check_performed",

  // Course events
  COURSE_GENERATED: "course_generated",
  COURSE_STARTED: "course_started",
  COURSE_COMPLETED: "course_completed",
  CHAPTER_COMPLETED: "chapter_completed",

  // Interview events
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEW_STARTED: "interview_started",
  INTERVIEW_COMPLETED: "interview_completed",
  VOICE_INTERVIEW_STARTED: "voice_interview_started",

  // Certificate events
  CERTIFICATE_EARNED: "certificate_earned",
  CERTIFICATE_DOWNLOADED: "certificate_downloaded",

  // Engagement events
  STREAK_MILESTONE: "streak_milestone",
  BADGE_EARNED: "badge_earned",
  CHATBOT_MESSAGE: "chatbot_message",

  // Conversion events
  FEATURE_USED: "feature_used",
  UPGRADE_CLICKED: "upgrade_clicked",
  SUBSCRIPTION_STARTED: "subscription_started",
};

class Analytics {
  constructor() {
    this.isEnabled = typeof window !== "undefined";
  }

  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    try {
      // Add timestamp and user context
      const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      };

      // Log in development
      logger.debug(`Analytics Event: ${eventName}`, eventData);

      // Google Analytics 4 (gtag)
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", eventName, eventData);
      }

      // Posthog
      if (typeof window.posthog !== "undefined") {
        window.posthog.capture(eventName, eventData);
      }

      // Custom tracking (you can add more platforms here)
      this._sendToCustomBackend(eventName, eventData);
    } catch (error) {
      logger.error("Analytics tracking error:", error);
    }
  }

  /**
   * Identify a user with properties
   * @param {string} userId - User ID
   * @param {Object} traits - User traits
   */
  identify(userId, traits = {}) {
    if (!this.isEnabled) return;

    try {
      logger.debug(`Analytics Identify: ${userId}`, traits);

      // Google Analytics
      if (typeof window.gtag !== "undefined") {
        window.gtag("config", "GA_MEASUREMENT_ID", {
          user_id: userId,
          user_properties: traits,
        });
      }

      // Posthog
      if (typeof window.posthog !== "undefined") {
        window.posthog.identify(userId, traits);
      }
    } catch (error) {
      logger.error("Analytics identify error:", error);
    }
  }

  /**
   * Track page view
   * @param {string} path - Page path
   * @param {Object} properties - Page properties
   */
  pageView(path, properties = {}) {
    if (!this.isEnabled) return;

    try {
      const pageData = {
        page_path: path,
        page_title: document.title,
        ...properties,
      };

      logger.debug("Analytics Page View:", pageData);

      // Google Analytics
      if (typeof window.gtag !== "undefined") {
        window.gtag("config", "GA_MEASUREMENT_ID", {
          page_path: path,
        });
      }

      // Posthog
      if (typeof window.posthog !== "undefined") {
        window.posthog.capture("$pageview", pageData);
      }
    } catch (error) {
      logger.error("Analytics page view error:", error);
    }
  }

  /**
   * Track a conversion event
   * @param {string} conversionName - Conversion name
   * @param {number} value - Conversion value
   * @param {Object} properties - Additional properties
   */
  conversion(conversionName, value = 0, properties = {}) {
    this.track(conversionName, {
      ...properties,
      value,
      currency: "USD",
    });
  }

  /**
   * Send custom tracking data to your backend
   * @private
   */
  async _sendToCustomBackend(eventName, eventData) {
    // Implement your custom tracking endpoint here
    // Example: Send to your own analytics API
    /*
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, data: eventData })
      });
    } catch (error) {
      logger.error('Custom analytics error:', error);
    }
    */
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience methods for common events
export const trackEvent = {
  // User events
  userSignup: (userId, method) =>
    analytics.track(EVENT_TYPES.USER_SIGNUP, { userId, method }),
  userLogin: (userId, method) =>
    analytics.track(EVENT_TYPES.USER_LOGIN, { userId, method }),
  onboardingComplete: (userId, industry) =>
    analytics.track(EVENT_TYPES.ONBOARDING_COMPLETE, { userId, industry }),

  // Resume events
  resumeCreated: (userId, resumeId) =>
    analytics.track(EVENT_TYPES.RESUME_CREATED, { userId, resumeId }),
  resumeDownloaded: (userId, resumeId, format) =>
    analytics.track(EVENT_TYPES.RESUME_DOWNLOADED, {
      userId,
      resumeId,
      format,
    }),
  atsCheckPerformed: (userId, score) =>
    analytics.track(EVENT_TYPES.ATS_CHECK_PERFORMED, { userId, score }),

  // Course events
  courseGenerated: (userId, courseId, topic) =>
    analytics.track(EVENT_TYPES.COURSE_GENERATED, { userId, courseId, topic }),
  courseStarted: (userId, courseId) =>
    analytics.track(EVENT_TYPES.COURSE_STARTED, { userId, courseId }),
  courseCompleted: (userId, courseId, completionTime) =>
    analytics.track(EVENT_TYPES.COURSE_COMPLETED, {
      userId,
      courseId,
      completionTime,
    }),
  chapterCompleted: (userId, courseId, chapterId, progress) =>
    analytics.track(EVENT_TYPES.CHAPTER_COMPLETED, {
      userId,
      courseId,
      chapterId,
      progress,
    }),

  // Interview events
  interviewStarted: (userId, interviewId, type) =>
    analytics.track(EVENT_TYPES.INTERVIEW_STARTED, {
      userId,
      interviewId,
      type,
    }),
  interviewCompleted: (userId, interviewId, score) =>
    analytics.track(EVENT_TYPES.INTERVIEW_COMPLETED, {
      userId,
      interviewId,
      score,
    }),

  // Certificate events
  certificateEarned: (userId, certificateId, courseTitle) =>
    analytics.track(EVENT_TYPES.CERTIFICATE_EARNED, {
      userId,
      certificateId,
      courseTitle,
    }),

  // Engagement events
  streakMilestone: (userId, streakCount, milestone) =>
    analytics.track(EVENT_TYPES.STREAK_MILESTONE, {
      userId,
      streakCount,
      milestone,
    }),
  badgeEarned: (userId, badgeId, badgeName) =>
    analytics.track(EVENT_TYPES.BADGE_EARNED, { userId, badgeId, badgeName }),

  // Feature usage
  featureUsed: (userId, featureName) =>
    analytics.track(EVENT_TYPES.FEATURE_USED, { userId, featureName }),
};

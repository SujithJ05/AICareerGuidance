import {
  format,
  formatDistance,
  formatDistanceToNow,
  isValid,
  parseISO,
} from "date-fns";
import { logger } from "@/lib/logger";

/**
 * Date utility functions
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format pattern (default: "MMM dd, yyyy")
 */
export function formatDate(date, formatStr = "MMM dd, yyyy") {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    logger.error("Invalid date:", date);
    return "";
  }

  return format(dateObj, formatStr);
}

/**
 * Format date to full datetime string
 */
export function formatDateTime(date) {
  return formatDate(date, "MMM dd, yyyy 'at' h:mm a");
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date) {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return "";

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Get time between two dates
 */
export function getTimeBetween(startDate, endDate) {
  if (!startDate || !endDate) return "";

  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return "";

  return formatDistance(start, end);
}

/**
 * Check if date is today
 */
export function isToday(date) {
  if (!date) return false;

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is this week
 */
export function isThisWeek(date) {
  if (!date) return false;

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return dateObj >= weekAgo && dateObj <= today;
}

/**
 * Get days between two dates
 */
export function getDaysBetween(startDate, endDate) {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${mins} min`;
}

/**
 * Get start of day
 */
export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function getEndOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return dateObj < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return dateObj > new Date();
}

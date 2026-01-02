export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 255);
}

export function sanitizeEmail(email) {
  return email.toLowerCase().trim();
}

export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.href;
  } catch {
    return "";
  }
}

export function sanitizeObject(obj, allowedKeys) {
  const sanitized = {};
  for (const key of allowedKeys) {
    if (obj[key] !== undefined) {
      sanitized[key] =
        typeof obj[key] === "string" ? sanitizeInput(obj[key]) : obj[key];
    }
  }
  return sanitized;
}

export function validateFileType(filename, allowedTypes) {
  const ext = filename.split(".").pop().toLowerCase();
  return allowedTypes.includes(`.${ext}`);
}

export function validateFileSize(size, maxSize) {
  return size <= maxSize;
}

export function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

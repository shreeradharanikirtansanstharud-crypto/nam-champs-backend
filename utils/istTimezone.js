// Timezone utility for backend
// Ensures consistent IST calculations regardless of server timezone
// Works on both local machines and cloud servers like Render

/**
 * Get current time in IST timezone
 * IST = UTC+5:30 (always add 5.5 hours to UTC)
 * This doesn't depend on server system timezone at all
 */
function getISTTime() {
  const now = new Date();
  // Check system timezone offset in minutes
  // IST is UTC+5:30, so offset is -330
  const offset = now.getTimezoneOffset();
  // If system is already IST (offset -330), use system time
  if (offset === -330) {
    return now;
  }
  // Otherwise, add 5.5 hours to UTC
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime;
}

/**
 * Get current IST hour (0-23)
 */
function getISTHour() {
  return getISTTime().getHours();
}

/**
 * Check if current time (IST) is after a specific hour
 * @param hour - Hour to check (0-23, 24-hour format)
 * @returns true if IST hour >= specified hour
 */
function isAfterHour(hour) {
  return getISTHour() >= hour;
}

/**
 * Get formatted IST time for logging
 */
function getFormattedISTTime() {
  const istTime = getISTTime();
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const date = String(istTime.getDate()).padStart(2, '0');
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds} IST`;
}

/**
 * Get today's date at midnight (IST)
 * Used for grouping counts by day in IST timezone
 */
function getTodayDateIST() {
  const istTime = getISTTime();
  return new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate(), 0, 0, 0, 0);
}

module.exports = {
  getISTTime,
  getISTHour,
  isAfterHour,
  getFormattedISTTime,
  getTodayDateIST,
};

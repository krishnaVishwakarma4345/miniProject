/**
 * Date and Time Utility Functions
 *
 * Common date operations used throughout the app.
 * Handles formatting, parsing, relative time, and timezone operations.
 */

/**
 * Format date to locale string
 * @param date - Date object or timestamp
 * @param locale - Locale code (default: 'en-US')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
 * // "January 15, 2024"
 */
export function formatDate(
  date: Date | number,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, options);
}

/**
 * Format date and time
 * @param date - Date object or timestamp
 * @param locale - Locale code
 * @returns Formatted datetime string
 *
 * @example
 * formatDateTime(new Date())
 * // "January 15, 2024, 2:30 PM"
 */
export function formatDateTime(
  date: Date | number,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format time only
 * @param date - Date object or timestamp
 * @param locale - Locale code
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date())
 * // "2:30 PM"
 */
export function formatTime(
  date: Date | number,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date object or timestamp
 * @param baseDate - Base date for relative calculation (default: now)
 * @returns Relative time string
 *
 * @example
 * getRelativeTime(Date.now() - 3600000)
 * // "1 hour ago"
 */
export function getRelativeTime(
  date: Date | number,
  baseDate: Date | number = Date.now()
): string {
  const dateMs = typeof date === "number" ? date : date.getTime();
  const baseMs = typeof baseDate === "number" ? baseDate : baseDate.getTime();

  const diffMs = baseMs - dateMs;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns true if date is today
 */
export function isToday(date: Date | number): boolean {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 * @param date - Date to check
 * @returns true if date is tomorrow
 */
export function isTomorrow(date: Date | number): boolean {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is yesterday
 * @param date - Date to check
 * @returns true if date is yesterday
 */
export function isYesterday(date: Date | number): boolean {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Get start of day (00:00:00)
 * @param date - Date object or timestamp (default: now)
 * @returns Start of day as timestamp
 */
export function getStartOfDay(date: Date | number = Date.now()): number {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  const start = new Date(dateObj);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

/**
 * Get end of day (23:59:59)
 * @param date - Date object or timestamp (default: now)
 * @returns End of day as timestamp
 */
export function getEndOfDay(date: Date | number = Date.now()): number {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  const end = new Date(dateObj);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/**
 * Add days to date
 * @param date - Base date
 * @param days - Number of days to add (negative to subtract)
 * @returns New date as timestamp
 */
export function addDays(date: Date | number, days: number): number {
  const dateObj = typeof date === "number" ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj.getTime();
}

/**
 * Add hours to date
 * @param date - Base date
 * @param hours - Number of hours to add
 * @returns New date as timestamp
 */
export function addHours(date: Date | number, hours: number): number {
  const dateObj = typeof date === "number" ? new Date(date) : new Date(date);
  dateObj.setHours(dateObj.getHours() + hours);
  return dateObj.getTime();
}

/**
 * Get difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export function getDaysDifference(
  date1: Date | number,
  date2: Date | number
): number {
  const ms1 = typeof date1 === "number" ? date1 : date1.getTime();
  const ms2 = typeof date2 === "number" ? date2 : date2.getTime();

  const diffMs = Math.abs(ms2 - ms1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is within date range
 * @param date - Date to check
 * @param startDate - Range start (inclusive)
 * @param endDate - Range end (inclusive)
 * @returns true if date is within range
 */
export function isDateInRange(
  date: Date | number,
  startDate: Date | number,
  endDate: Date | number
): boolean {
  const ms = typeof date === "number" ? date : date.getTime();
  const startMs = typeof startDate === "number" ? startDate : startDate.getTime();
  const endMs = typeof endDate === "number" ? endDate : endDate.getTime();

  return ms >= startMs && ms <= endMs;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string
 *
 * @example
 * formatAsISO(new Date('2024-01-15'))
 * // "2024-01-15"
 */
export function formatAsISO(date: Date | number): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}

/**
 * Parse ISO date string to timestamp
 * @param isoString - ISO date string (YYYY-MM-DD or ISO 8601)
 * @returns Timestamp in milliseconds
 */
export function parseISO(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * Get array of dates in range
 * @param startDate - Range start
 * @param endDate - Range end
 * @param step - Step in days (default: 1)
 * @returns Array of dates as timestamps
 */
export function getDateRange(
  startDate: Date | number,
  endDate: Date | number,
  step: number = 1
): number[] {
  const dates: number[] = [];
  let currentDate = typeof startDate === "number" ? startDate : startDate.getTime();
  const endMs = typeof endDate === "number" ? endDate : endDate.getTime();

  while (currentDate <= endMs) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, step);
  }

  return dates;
}

/**
 * Get start of week (Monday)
 * @param date - Date in the week
 * @returns Start of week as timestamp
 */
export function getStartOfWeek(date: Date | number): number {
  const dateObj = typeof date === "number" ? new Date(date) : new Date(date);
  const dayOfWeek = dateObj.getDay();
  const diff = dateObj.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday
  dateObj.setDate(diff);
  return getStartOfDay(dateObj);
}

/**
 * Get start of month
 * @param date - Date in the month
 * @returns Start of month as timestamp
 */
export function getStartOfMonth(date: Date | number): number {
  const dateObj = typeof date === "number" ? new Date(date) : new Date(date);
  dateObj.setDate(1);
  return getStartOfDay(dateObj);
}

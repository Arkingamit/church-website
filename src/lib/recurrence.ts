/**
 * Shared recurrence calculation utilities.
 * Used by both the cron job and the announcement API.
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Calculate the next occurrence date for a recurring announcement.
 * Returns ISO date string (YYYY-MM-DD) or null if past end date.
 */
export function calculateNextOccurrence(
  pattern: string,
  day: string | undefined,
  fromDate: string,
  endDate?: string
): string | null {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // If we've passed the end date, stop recurring
  if (endDate && today > endDate) return null;

  const dayIndex = day ? DAYS.indexOf(day) : -1;

  let next: Date;

  switch (pattern) {
    case 'weekly': {
      if (dayIndex === -1) return null;
      next = new Date(now);
      const currentDay = next.getDay();
      let daysUntil = dayIndex - currentDay;
      if (daysUntil <= 0) daysUntil += 7; // next week
      next.setDate(next.getDate() + daysUntil);
      break;
    }
    case 'biweekly': {
      if (dayIndex === -1) return null;
      next = new Date(now);
      const currentDay2 = next.getDay();
      let daysUntil2 = dayIndex - currentDay2;
      if (daysUntil2 <= 0) daysUntil2 += 14;
      next.setDate(next.getDate() + daysUntil2);
      break;
    }
    case 'monthly': {
      const startDate = new Date(fromDate);
      next = new Date(now);
      // Set to the same day-of-month as the start date
      next.setDate(startDate.getDate());
      // If that day has already passed this month, go to next month
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      break;
    }
    default: {
      // Custom — advance by 7 days from today as a fallback
      next = new Date(now);
      next.setDate(next.getDate() + 7);
    }
  }

  const nextStr = next.toISOString().split('T')[0];
  if (endDate && nextStr > endDate) return null;
  return nextStr;
}

/**
 * Check if today matches a recurring schedule.
 */
export function isTodayMatchingSchedule(announcement: {
  recurrencePattern?: string;
  recurrenceDay?: string;
  nextOccurrence?: string;
  date?: string;
}): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayDayName = DAYS[now.getDay()];

  // If nextOccurrence is set, use that for precise matching
  if (announcement.nextOccurrence) {
    return today === announcement.nextOccurrence;
  }

  // Fallback: check by pattern
  const pattern = announcement.recurrencePattern;
  const day = announcement.recurrenceDay;

  switch (pattern) {
    case 'weekly':
      return todayDayName === day;
    case 'biweekly': {
      if (todayDayName !== day) return false;
      const start = new Date(announcement.date || '');
      const diffMs = now.getTime() - start.getTime();
      const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      return diffWeeks % 2 === 0;
    }
    case 'monthly': {
      const startDay = new Date(announcement.date || '').getDate();
      return now.getDate() === startDay;
    }
    default:
      return false;
  }
}

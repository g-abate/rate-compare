/**
 * Date handling utilities
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, formatString: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }

    return format(dateObj, formatString);
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error formatting date:', error);
    }
    return 'Invalid Date';
  }
}

/**
 * Calculate the number of nights between two dates
 */
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  try {
    const checkInDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
    const checkOutDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;

    if (!isValid(checkInDate) || !isValid(checkOutDate)) {
      throw new Error('Invalid date');
    }

    const nights = differenceInDays(checkOutDate, checkInDate);
    return Math.max(0, nights);
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error calculating nights:', error);
    }
    return 0;
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return true; // Treat invalid dates as past
    }

    const today = new Date();
    const checkDate = new Date(dateObj);

    // Normalize to UTC midnight for comparison
    today.setUTCHours(0, 0, 0, 0);
    checkDate.setUTCHours(0, 0, 0, 0);

    return checkDate < today;
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking if date is past:', error);
    }
    return true;
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return false;
    }

    const today = new Date();
    const checkDate = new Date(dateObj);

    // Normalize to UTC midnight for comparison
    today.setUTCHours(0, 0, 0, 0);
    checkDate.setUTCHours(0, 0, 0, 0);

    return checkDate.getTime() === today.getTime();
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking if date is today:', error);
    }
    return false;
  }
}

/**
 * Get a date range as an array of dates
 */
export function getDateRange(startDate: string | Date, endDate: string | Date): Date[] {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) {
      throw new Error('Invalid date');
    }

    const dates: Date[] = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);

    // Normalize to UTC midnight
    currentDate.setUTCHours(0, 0, 0, 0);
    endDateObj.setUTCHours(0, 0, 0, 0);

    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting date range:', error);
    }
    return [];
  }
}

/**
 * Validate a date string
 */
export function isValidDateString(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch (error) {
    return false;
  }
}

/**
 * Get the current date in ISO format
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Add days to a date and return ISO string
 */
export function addDaysToDate(date: string | Date, days: number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }

    const newDate = addDays(dateObj, days);
    return newDate.toISOString();
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding days to date:', error);
    }
    return getCurrentISODate();
  }
}

/**
 * Format date for API requests (YYYY-MM-DD)
 */
export function formatDateForAPI(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }

    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error formatting date for API:', error);
    }
    return format(new Date(), 'yyyy-MM-dd');
  }
}

/**
 * Parse a date from API response
 */
export function parseDateFromAPI(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch (error) {
    // Log error in development, return fallback in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error parsing date from API:', error);
    }
    return null;
  }
}

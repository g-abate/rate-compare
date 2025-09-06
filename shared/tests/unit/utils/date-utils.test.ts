/**
 * Date utilities tests
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  calculateNights,
  isPastDate,
  isToday,
  getDateRange,
  isValidDateString,
  getCurrentISODate,
  addDaysToDate,
  formatDateForAPI,
  parseDateFromAPI
} from '../../../src/utils/date-utils';

describe('Date Utils', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const result = formatDate('2024-01-15T12:00:00.000Z');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format a Date object', () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should use custom format string', () => {
      const result = formatDate('2024-01-15T12:00:00.000Z', 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid date strings', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });

    it('should handle invalid Date objects', () => {
      const result = formatDate(new Date('invalid'));
      expect(result).toBe('Invalid Date');
    });
  });

  describe('calculateNights', () => {
    it('should calculate nights between two valid dates', () => {
      const nights = calculateNights('2024-01-15T12:00:00.000Z', '2024-01-17T12:00:00.000Z');
      expect(nights).toBe(2);
    });

    it('should calculate nights between Date objects', () => {
      const checkIn = new Date('2024-01-15T12:00:00.000Z');
      const checkOut = new Date('2024-01-17T12:00:00.000Z');
      const nights = calculateNights(checkIn, checkOut);
      expect(nights).toBe(2);
    });

    it('should return 0 for same day', () => {
      const nights = calculateNights('2024-01-15T12:00:00.000Z', '2024-01-15T23:59:59.000Z');
      expect(nights).toBe(0);
    });

    it('should return 0 for invalid dates', () => {
      const nights = calculateNights('invalid-date', '2024-01-17T12:00:00.000Z');
      expect(nights).toBe(0);
    });

    it('should return 0 for past check-out', () => {
      const nights = calculateNights('2024-01-17T12:00:00.000Z', '2024-01-15T12:00:00.000Z');
      expect(nights).toBe(0);
    });
  });

  describe('isPastDate', () => {
    it('should return true for past dates', () => {
      const result = isPastDate('2024-01-14T12:00:00.000Z');
      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const result = isPastDate('2024-01-16T12:00:00.000Z');
      expect(result).toBe(false);
    });

    it('should return false for today', () => {
      const result = isPastDate('2024-01-15T12:00:00.000Z');
      expect(result).toBe(false);
    });

    it('should return true for invalid dates', () => {
      const result = isPastDate('invalid-date');
      expect(result).toBe(true);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const result = isToday('2024-01-15T12:00:00.000Z');
      expect(result).toBe(true);
    });

    it('should return false for past dates', () => {
      const result = isToday('2024-01-14T12:00:00.000Z');
      expect(result).toBe(false);
    });

    it('should return false for future dates', () => {
      const result = isToday('2024-01-16T12:00:00.000Z');
      expect(result).toBe(false);
    });

    it('should return false for invalid dates', () => {
      const result = isToday('invalid-date');
      expect(result).toBe(false);
    });
  });

  describe('getDateRange', () => {
    it('should return array of dates for valid range', () => {
      const dates = getDateRange('2024-01-15T12:00:00.000Z', '2024-01-17T12:00:00.000Z');
      expect(dates).toHaveLength(3);
      expect(dates[0]).toEqual(new Date('2024-01-15T00:00:00.000Z'));
      expect(dates[1]).toEqual(new Date('2024-01-16T00:00:00.000Z'));
      expect(dates[2]).toEqual(new Date('2024-01-17T00:00:00.000Z'));
    });

    it('should return single date for same day', () => {
      const dates = getDateRange('2024-01-15T12:00:00.000Z', '2024-01-15T23:59:59.000Z');
      expect(dates).toHaveLength(1);
      expect(dates[0]).toEqual(new Date('2024-01-15T00:00:00.000Z'));
    });

    it('should return empty array for invalid dates', () => {
      const dates = getDateRange('invalid-date', '2024-01-17T12:00:00.000Z');
      expect(dates).toEqual([]);
    });
  });

  describe('isValidDateString', () => {
    it('should return true for valid ISO date strings', () => {
      expect(isValidDateString('2024-01-15T00:00:00.000Z')).toBe(true);
      expect(isValidDateString('2024-01-15')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('not-a-date')).toBe(false);
    });
  });

  describe('getCurrentISODate', () => {
    it('should return current date in ISO format', () => {
      const result = getCurrentISODate();
      expect(result).toBe('2024-01-15T12:00:00.000Z');
    });
  });

  describe('addDaysToDate', () => {
    it('should add days to a valid date string', () => {
      const result = addDaysToDate('2024-01-15T12:00:00.000Z', 5);
      expect(result).toBe('2024-01-20T12:00:00.000Z');
    });

    it('should add days to a Date object', () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = addDaysToDate(date, 3);
      expect(result).toBe('2024-01-18T12:00:00.000Z');
    });

    it('should handle negative days', () => {
      const result = addDaysToDate('2024-01-15T12:00:00.000Z', -5);
      expect(result).toBe('2024-01-10T12:00:00.000Z');
    });

    it('should return current date for invalid input', () => {
      const result = addDaysToDate('invalid-date', 5);
      expect(result).toBe('2024-01-15T12:00:00.000Z');
    });
  });

  describe('formatDateForAPI', () => {
    it('should format date for API requests', () => {
      const result = formatDateForAPI('2024-01-15T12:00:00.000Z');
      expect(result).toBe('2024-01-15');
    });

    it('should format Date object for API requests', () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = formatDateForAPI(date);
      expect(result).toBe('2024-01-15');
    });

    it('should return current date for invalid input', () => {
      const result = formatDateForAPI('invalid-date');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('parseDateFromAPI', () => {
    it('should parse valid date from API', () => {
      const result = parseDateFromAPI('2024-01-15T12:00:00.000Z');
      expect(result).toEqual(new Date('2024-01-15T12:00:00.000Z'));
    });

    it('should return null for invalid date', () => {
      const result = parseDateFromAPI('invalid-date');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseDateFromAPI('');
      expect(result).toBeNull();
    });
  });
});

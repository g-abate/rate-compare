/**
 * Rate data model tests
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  RateData,
  PropertyConfig,
  validateRateData,
  validatePropertyConfig,
  createRateData,
  createPropertyConfig
} from '../../../src/data-models/rate-data';

describe('Rate Data Models', () => {
  describe('validateRateData', () => {
    it('should validate correct rate data', () => {
      const validRateData: RateData = {
        channel: 'airbnb',
        propertyId: '123',
        checkIn: '2024-01-01T00:00:00.000Z',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: 100,
        fees: {
          cleaning: 20,
          service: 10,
          taxes: 15,
          other: 5
        },
        totalPrice: 150,
        currency: 'USD',
        availability: true,
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(validRateData)).toBe(true);
    });

    it('should reject invalid channel', () => {
      const invalidData = {
        channel: 'invalid',
        propertyId: '123',
        checkIn: '2024-01-01T00:00:00.000Z',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: 100,
        fees: { cleaning: 0, service: 0, taxes: 0, other: 0 },
        totalPrice: 100,
        currency: 'USD',
        availability: true,
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(invalidData)).toBe(false);
    });

    it('should reject empty property ID', () => {
      const invalidData = {
        channel: 'airbnb',
        propertyId: '',
        checkIn: '2024-01-01T00:00:00.000Z',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: 100,
        fees: { cleaning: 0, service: 0, taxes: 0, other: 0 },
        totalPrice: 100,
        currency: 'USD',
        availability: true,
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(invalidData)).toBe(false);
    });

    it('should reject invalid dates', () => {
      const invalidData = {
        channel: 'airbnb',
        propertyId: '123',
        checkIn: 'invalid-date',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: 100,
        fees: { cleaning: 0, service: 0, taxes: 0, other: 0 },
        totalPrice: 100,
        currency: 'USD',
        availability: true,
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(invalidData)).toBe(false);
    });

    it('should reject negative prices', () => {
      const invalidData = {
        channel: 'airbnb',
        propertyId: '123',
        checkIn: '2024-01-01T00:00:00.000Z',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: -100,
        fees: { cleaning: 0, service: 0, taxes: 0, other: 0 },
        totalPrice: 100,
        currency: 'USD',
        availability: true,
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(invalidData)).toBe(false);
    });

    it('should reject invalid currency', () => {
      const invalidData = {
        channel: 'airbnb',
        propertyId: '123',
        checkIn: '2024-01-01T00:00:00.000Z',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: 100,
        fees: { cleaning: 0, service: 0, taxes: 0, other: 0 },
        totalPrice: 100,
        currency: 'INVALID',
        availability: true,
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(invalidData)).toBe(false);
    });

    it('should reject non-boolean availability', () => {
      const invalidData = {
        channel: 'airbnb',
        propertyId: '123',
        checkIn: '2024-01-01T00:00:00.000Z',
        checkOut: '2024-01-02T00:00:00.000Z',
        basePrice: 100,
        fees: { cleaning: 0, service: 0, taxes: 0, other: 0 },
        totalPrice: 100,
        currency: 'USD',
        availability: 'yes',
        lastUpdated: '2024-01-01T12:00:00.000Z'
      };

      expect(validateRateData(invalidData)).toBe(false);
    });

    it('should reject null or undefined data', () => {
      expect(validateRateData(null)).toBe(false);
      expect(validateRateData(undefined)).toBe(false);
    });

    it('should reject non-object data', () => {
      expect(validateRateData('string')).toBe(false);
      expect(validateRateData(123)).toBe(false);
      expect(validateRateData([])).toBe(false);
    });
  });

  describe('validatePropertyConfig', () => {
    it('should validate correct property configuration', () => {
      const validConfig: PropertyConfig = {
        id: 'prop-123',
        name: 'Beautiful Villa',
        channels: {
          airbnb: 'https://airbnb.com/rooms/123',
          vrbo: 'https://vrbo.com/property/456',
          booking: 'https://booking.com/hotel/test'
        },
        settings: {
          displayMode: 'inline',
          theme: 'light',
          locale: 'en-US'
        }
      };

      expect(validatePropertyConfig(validConfig)).toBe(true);
    });

    it('should validate config with empty channels', () => {
      const validConfig: PropertyConfig = {
        id: 'prop-123',
        name: 'Beautiful Villa',
        channels: {},
        settings: {
          displayMode: 'floating',
          theme: 'dark',
          locale: 'es-ES'
        }
      };

      expect(validatePropertyConfig(validConfig)).toBe(true);
    });

    it('should reject invalid display mode', () => {
      const invalidConfig = {
        id: 'prop-123',
        name: 'Beautiful Villa',
        channels: {},
        settings: {
          displayMode: 'invalid',
          theme: 'light',
          locale: 'en-US'
        }
      };

      expect(validatePropertyConfig(invalidConfig)).toBe(false);
    });

    it('should reject invalid theme', () => {
      const invalidConfig = {
        id: 'prop-123',
        name: 'Beautiful Villa',
        channels: {},
        settings: {
          displayMode: 'inline',
          theme: 'invalid',
          locale: 'en-US'
        }
      };

      expect(validatePropertyConfig(invalidConfig)).toBe(false);
    });

    it('should reject empty ID or name', () => {
      const invalidConfig1 = {
        id: '',
        name: 'Beautiful Villa',
        channels: {},
        settings: {
          displayMode: 'inline',
          theme: 'light',
          locale: 'en-US'
        }
      };

      const invalidConfig2 = {
        id: 'prop-123',
        name: '',
        channels: {},
        settings: {
          displayMode: 'inline',
          theme: 'light',
          locale: 'en-US'
        }
      };

      expect(validatePropertyConfig(invalidConfig1)).toBe(false);
      expect(validatePropertyConfig(invalidConfig2)).toBe(false);
    });

    it('should reject null or undefined config', () => {
      expect(validatePropertyConfig(null)).toBe(false);
      expect(validatePropertyConfig(undefined)).toBe(false);
    });
  });

  describe('createRateData', () => {
    it('should create rate data with defaults', () => {
      const rateData = createRateData();

      expect(rateData.channel).toBe('airbnb');
      expect(rateData.propertyId).toBe('');
      expect(rateData.basePrice).toBe(0);
      expect(rateData.totalPrice).toBe(0);
      expect(rateData.currency).toBe('USD');
      expect(rateData.availability).toBe(true);
      expect(rateData.fees).toEqual({
        cleaning: 0,
        service: 0,
        taxes: 0,
        other: 0
      });
      expect(typeof rateData.lastUpdated).toBe('string');
    });

    it('should create rate data with overrides', () => {
      const overrides = {
        channel: 'vrbo' as const,
        propertyId: 'test-123',
        basePrice: 200,
        totalPrice: 250
      };

      const rateData = createRateData(overrides);

      expect(rateData.channel).toBe('vrbo');
      expect(rateData.propertyId).toBe('test-123');
      expect(rateData.basePrice).toBe(200);
      expect(rateData.totalPrice).toBe(250);
    });
  });

  describe('createPropertyConfig', () => {
    it('should create property config with defaults', () => {
      const config = createPropertyConfig();

      expect(config.id).toBe('');
      expect(config.name).toBe('');
      expect(config.channels).toEqual({});
      expect(config.settings.displayMode).toBe('inline');
      expect(config.settings.theme).toBe('light');
      expect(config.settings.locale).toBe('en-US');
    });

    it('should create property config with overrides', () => {
      const overrides = {
        id: 'test-prop',
        name: 'Test Property',
        settings: {
          displayMode: 'floating' as const,
          theme: 'dark' as const,
          locale: 'fr-FR'
        }
      };

      const config = createPropertyConfig(overrides);

      expect(config.id).toBe('test-prop');
      expect(config.name).toBe('Test Property');
      expect(config.settings.displayMode).toBe('floating');
      expect(config.settings.theme).toBe('dark');
      expect(config.settings.locale).toBe('fr-FR');
    });
  });
});

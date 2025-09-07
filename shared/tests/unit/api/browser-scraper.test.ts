/**
 * Unit tests for BrowserAirbnbScraper
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import { BrowserAirbnbScraper, BrowserScraperOptions, ScrapingOptions } from '../../../src/api/browser-scraper';

// Mock puppeteer
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(),
  },
}));

const mockPuppeteer = puppeteer as any;

describe('BrowserAirbnbScraper', () => {
  let scraper: BrowserAirbnbScraper;
  let mockBrowser: Partial<Browser>;
  let mockPage: Partial<Page>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock page
    mockPage = {
      newPage: vi.fn(),
      setUserAgent: vi.fn(),
      setViewport: vi.fn(),
      setExtraHTTPHeaders: vi.fn(),
      evaluateOnNewDocument: vi.fn(),
      goto: vi.fn(),
      waitForTimeout: vi.fn(),
      click: vi.fn(),
      waitForSelector: vi.fn(),
      evaluate: vi.fn(),
      close: vi.fn(),
    };

    // Create mock browser
    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    };

    // Mock puppeteer.launch
    mockPuppeteer.launch.mockResolvedValue(mockBrowser);

    // Create scraper instance
    scraper = new BrowserAirbnbScraper({
      headless: true,
      slowMo: 0,
      timeout: 10000,
    });
  });

  afterEach(async () => {
    await scraper.cleanup();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultScraper = new BrowserAirbnbScraper();
      expect(defaultScraper).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const options: BrowserScraperOptions = {
        headless: false,
        slowMo: 200,
        timeout: 15000,
        userAgent: 'Custom Agent',
        viewport: { width: 1920, height: 1080 },
      };
      const customScraper = new BrowserAirbnbScraper(options);
      expect(customScraper).toBeDefined();
    });
  });

  describe('init', () => {
    it('should initialize browser and page successfully', async () => {
      await scraper.init();

      expect(mockPuppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        slowMo: 0,
        args: expect.arrayContaining([
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ]),
      });

      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.setUserAgent).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalled();
      expect(mockPage.setExtraHTTPHeaders).toHaveBeenCalled();
      expect(mockPage.evaluateOnNewDocument).toHaveBeenCalledTimes(2);
    });

    it('should throw error if browser launch fails', async () => {
      mockPuppeteer.launch.mockRejectedValue(new Error('Browser launch failed'));

      await expect(scraper.init()).rejects.toThrow('Browser launch failed');
    });
  });

  describe('cleanup', () => {
    it('should close page and browser', async () => {
      await scraper.init();
      await scraper.cleanup();

      expect(mockPage.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle cleanup when browser is not initialized', async () => {
      await expect(scraper.cleanup()).resolves.not.toThrow();
    });
  });

  describe('extractPropertyId', () => {
    it('should extract property ID from valid URL', () => {
      const url = 'https://www.airbnb.com/rooms/123456789';
      // Access private method for testing
      const propertyId = (scraper as any).extractPropertyId(url);
      expect(propertyId).toBe('123456789');
    });

    it('should return empty string for invalid URL', () => {
      const url = 'https://www.airbnb.com/invalid-url';
      const propertyId = (scraper as any).extractPropertyId(url);
      expect(propertyId).toBe('');
    });
  });

  describe('navigateToProperty', () => {
    const mockOptions: ScrapingOptions = {
      propertyUrl: 'https://www.airbnb.com/rooms/123456789',
      checkIn: '2025-09-07',
      checkOut: '2025-09-12',
      propertyId: '123456789',
    };

    beforeEach(async () => {
      await scraper.init();
    });

    it('should navigate to property page successfully', async () => {
      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);

      await (scraper as any).navigateToProperty(mockOptions);

      expect(mockPage.goto).toHaveBeenCalledWith(mockOptions.propertyUrl, {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });
      expect(mockPage.waitForTimeout).toHaveBeenCalledWith(2000);
    });

    it('should attempt to set check-in date', async () => {
      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);
      (mockPage.click as Mock).mockResolvedValue(undefined);
      (mockPage.waitForSelector as Mock).mockResolvedValue({});

      await (scraper as any).navigateToProperty(mockOptions);

      expect(mockPage.click).toHaveBeenCalledWith('[data-testid="date-picker-checkin"]');
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '[data-testid="date-picker-day-2025-09-07"]',
        { timeout: 5000 }
      );
    });

    it('should attempt to set check-out date', async () => {
      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);
      (mockPage.click as Mock).mockResolvedValue(undefined);
      (mockPage.waitForSelector as Mock).mockResolvedValue({});

      await (scraper as any).navigateToProperty(mockOptions);

      expect(mockPage.click).toHaveBeenCalledWith('[data-testid="date-picker-checkout"]');
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '[data-testid="date-picker-day-2025-09-12"]',
        { timeout: 5000 }
      );
    });

    it('should attempt to click Reserve button', async () => {
      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);
      (mockPage.click as Mock).mockResolvedValue(undefined);
      (mockPage.waitForSelector as Mock).mockResolvedValue({});

      await (scraper as any).navigateToProperty(mockOptions);

      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '[data-testid="homes-pdp-cta"]',
        { timeout: 10000 }
      );
    });

    it('should throw error if browser not initialized', async () => {
      const uninitializedScraper = new BrowserAirbnbScraper();
      
      await expect(
        (uninitializedScraper as any).navigateToProperty(mockOptions)
      ).rejects.toThrow('Browser not initialized. Call init() first.');
    });
  });

  describe('extractDetailedPricingData', () => {
    beforeEach(async () => {
      await scraper.init();
    });

    it('should extract pricing data successfully', async () => {
      const mockPricingData = {
        basePrice: 1000,
        cleaningFee: 50,
        serviceFee: 100,
        taxes: 150,
        totalPrice: 1300,
        currency: 'USD',
        rawData: {
          accommodationSubtotal: 1000,
          discountAmount: 0,
        },
      };

      (mockPage.waitForSelector as Mock).mockResolvedValue({});
      (mockPage.evaluate as Mock).mockResolvedValue(mockPricingData);

      const result = await (scraper as any).extractDetailedPricingData();

      expect(result).toEqual(mockPricingData);
      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should handle missing pricing element gracefully', async () => {
      const mockPricingData = {
        basePrice: 0,
        cleaningFee: 0,
        serviceFee: 0,
        taxes: 0,
        totalPrice: 0,
        currency: 'USD',
        rawData: {},
      };

      (mockPage.waitForSelector as Mock).mockRejectedValue(new Error('Element not found'));
      (mockPage.evaluate as Mock).mockResolvedValue(mockPricingData);

      const result = await (scraper as any).extractDetailedPricingData();

      expect(result).toEqual(mockPricingData);
    });

    it('should throw error if browser not initialized', async () => {
      const uninitializedScraper = new BrowserAirbnbScraper();
      
      await expect(
        (uninitializedScraper as any).extractDetailedPricingData()
      ).rejects.toThrow('Browser not initialized. Call init() first.');
    });
  });

  describe('scrapeRates', () => {
    const mockOptions: ScrapingOptions = {
      propertyUrl: 'https://www.airbnb.com/rooms/123456789',
      checkIn: '2025-09-07',
      checkOut: '2025-09-12',
      propertyId: '123456789',
    };

    beforeEach(async () => {
      await scraper.init();
    });

    it('should scrape rates successfully', async () => {
      const mockPricingData = {
        basePrice: 1000,
        cleaningFee: 50,
        serviceFee: 100,
        taxes: 150,
        totalPrice: 1300,
        currency: 'USD',
        rawData: {
          accommodationSubtotal: 1000,
          discountAmount: 0,
        },
      };

      // Mock all the methods
      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);
      (mockPage.click as Mock).mockResolvedValue(undefined);
      (mockPage.waitForSelector as Mock).mockResolvedValue({});
      (mockPage.evaluate as Mock).mockResolvedValue(mockPricingData);

      const result = await scraper.scrapeRates(mockOptions);

      expect(result).toEqual({
        propertyId: '123456789',
        propertyUrl: mockOptions.propertyUrl,
        checkIn: mockOptions.checkIn,
        checkOut: mockOptions.checkOut,
        rates: [
          {
            channel: 'airbnb',
            propertyId: '123456789',
            checkIn: '2025-09-07',
            checkOut: '2025-09-12',
            basePrice: 1000,
            fees: {
              cleaning: 50,
              service: 100,
              taxes: 150,
              other: 0,
            },
            totalPrice: 1300,
            currency: 'USD',
            availability: true,
            lastUpdated: expect.any(String),
          },
        ],
        scrapedAt: expect.any(String),
        source: 'booking_page_detailed',
      });
    });

    it('should extract property ID from URL if not provided', async () => {
      const optionsWithoutId = {
        propertyUrl: 'https://www.airbnb.com/rooms/987654321',
        checkIn: '2025-09-07',
        checkOut: '2025-09-12',
      };

      const mockPricingData = {
        basePrice: 500,
        cleaningFee: 25,
        serviceFee: 50,
        taxes: 75,
        totalPrice: 650,
        currency: 'USD',
        rawData: {},
      };

      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);
      (mockPage.click as Mock).mockResolvedValue(undefined);
      (mockPage.waitForSelector as Mock).mockResolvedValue({});
      (mockPage.evaluate as Mock).mockResolvedValue(mockPricingData);

      const result = await scraper.scrapeRates(optionsWithoutId);

      expect(result.propertyId).toBe('987654321');
    });

    it('should handle scraping errors gracefully', async () => {
      (mockPage.goto as Mock).mockRejectedValue(new Error('Navigation failed'));

      await expect(scraper.scrapeRates(mockOptions)).rejects.toThrow('Navigation failed');
    });
  });

  describe('static scrapeRates', () => {
    const mockOptions: ScrapingOptions = {
      propertyUrl: 'https://www.airbnb.com/rooms/123456789',
      checkIn: '2025-09-07',
      checkOut: '2025-09-12',
    };

    it('should scrape rates and cleanup automatically', async () => {
      const mockPricingData = {
        basePrice: 1000,
        cleaningFee: 50,
        serviceFee: 100,
        taxes: 150,
        totalPrice: 1300,
        currency: 'USD',
        rawData: {},
      };

      // Mock all the methods
      (mockPage.goto as Mock).mockResolvedValue(undefined);
      (mockPage.waitForTimeout as Mock).mockResolvedValue(undefined);
      (mockPage.click as Mock).mockResolvedValue(undefined);
      (mockPage.waitForSelector as Mock).mockResolvedValue({});
      (mockPage.evaluate as Mock).mockResolvedValue(mockPricingData);

      const result = await BrowserAirbnbScraper.scrapeRates(mockOptions);

      expect(result).toBeDefined();
      expect(result.propertyId).toBe('123456789');
      expect(mockPage.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should cleanup even if scraping fails', async () => {
      (mockPage.goto as Mock).mockRejectedValue(new Error('Navigation failed'));

      await expect(BrowserAirbnbScraper.scrapeRates(mockOptions)).rejects.toThrow('Navigation failed');
      
      // Should still cleanup
      expect(mockPage.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});

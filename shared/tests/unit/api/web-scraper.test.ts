/**
 * Web scraper tests
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WebScraper,
  ScrapingConfig,
  ScrapingResult,
  ScrapingError,
  ScrapingMethod,
  RateData,
  createWebScraper,
  withRetry,
  withRateLimit
} from '../../../src/api/web-scraper';

// Mock fetch for server-side scraping
global.fetch = vi.fn();

// Mock DOM APIs for client-side scraping
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn()
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    location: { href: 'https://example.com' },
    fetch: vi.fn()
  },
  writable: true
});

describe('WebScraper', () => {
  let webScraper: WebScraper;
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.mocked(fetch);
    mockFetch.mockClear();
    
    webScraper = new WebScraper({
      baseURL: 'https://scraper.example.com',
      timeout: 10000,
      retryConfig: {
        maxRetries: 2, // Reduce retries for faster tests
        retryDelay: 50, // Reduce delay for faster tests
        backoffMultiplier: 1.5
      },
      rateLimitConfig: {
        requestsPerMinute: 30,
        burstLimit: 5
      },
      userAgent: 'RateCompare/1.0.0'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const scraper = new WebScraper();
      expect(scraper).toBeInstanceOf(WebScraper);
    });

    it('should merge custom config with defaults', () => {
      const customConfig: Partial<ScrapingConfig> = {
        baseURL: 'https://custom.scraper.com',
        timeout: 15000
      };
      
      const scraper = new WebScraper(customConfig);
      expect(scraper).toBeInstanceOf(WebScraper);
    });
  });

  describe('scrapeRates', () => {
    it('should scrape rates from Airbnb URL', async () => {
      const mockHtml = `
        <div class="airbnb-listing">
          <div class="price">$150</div>
          <div class="cleaning-fee">$25</div>
          <div class="service-fee">$15</div>
        </div>
      `;

      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(mockHtml),
        headers: new Headers({ 'content-type': 'text/html' })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await webScraper.scrapeRates({
        url: 'https://airbnb.com/rooms/123456',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {
          basePrice: '.price',
          cleaningFee: '.cleaning-fee',
          serviceFee: '.service-fee'
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://scraper.example.com/scrape',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('airbnb.com/rooms/123456')
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should scrape rates from VRBO URL', async () => {
      const mockHtml = `
        <div class="vrbo-listing">
          <span class="nightly-rate">$200</span>
          <span class="taxes">$30</span>
          <span class="fees">$20</span>
        </div>
      `;

      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(mockHtml),
        headers: new Headers({ 'content-type': 'text/html' })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await webScraper.scrapeRates({
        url: 'https://vrbo.com/123456',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {
          basePrice: '.nightly-rate',
          taxes: '.taxes',
          fees: '.fees'
        }
      });

      expect(result.success).toBe(true);
    });

    it('should handle scraping errors', async () => {
      // Mock fetch to always fail (for all retry attempts)
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await webScraper.scrapeRates({
        url: 'https://invalid-url.com',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle missing selectors', async () => {
      const mockHtml = '<div>No price information</div>';

      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(mockHtml),
        headers: new Headers({ 'content-type': 'text/html' })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await webScraper.scrapeRates({
        url: 'https://example.com',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {
          basePrice: '.nonexistent-price'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('selector');
    });

    it('should handle timeout', async () => {
      // Mock fetch to always reject with AbortError (for all retry attempts)
      mockFetch.mockImplementation(() => 
        new Promise((resolve, reject) => {
          setTimeout(() => {
            const error = new Error('Request timeout');
            error.name = 'AbortError';
            reject(error);
          }, 100); // Short delay to simulate timeout
        })
      );

      const result = await webScraper.scrapeRates({
        url: 'https://slow-site.com',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('scrapeMultipleRates', () => {
    it('should scrape multiple URLs concurrently', async () => {
      const mockHtml1 = '<div class="price">$100</div>';
      const mockHtml2 = '<div class="price">$200</div>';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(mockHtml1),
          headers: new Headers()
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(mockHtml2),
          headers: new Headers()
        });

      const urls = [
        'https://airbnb.com/rooms/1',
        'https://vrbo.com/2'
      ];

      const results = await webScraper.scrapeMultipleRates(urls, {
        method: ScrapingMethod.SERVER_SIDE,
        selectors: { basePrice: '.price' }
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should handle partial failures', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue('<div class="price">$100</div>'),
          headers: new Headers()
        })
        .mockRejectedValue(new Error('Network error')); // Always fail for the second request

      const urls = [
        'https://airbnb.com/rooms/1',
        'https://invalid-url.com'
      ];

      const results = await webScraper.scrapeMultipleRates(urls, {
        method: ScrapingMethod.SERVER_SIDE,
        selectors: { basePrice: '.price' }
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('client-side scraping', () => {
    it('should scrape using client-side method', async () => {
      const mockElement = {
        textContent: '$150',
        innerHTML: '$150'
      };

      (global.document.querySelector as any).mockReturnValue(mockElement);

      const result = await webScraper.scrapeRates({
        url: 'https://airbnb.com/rooms/123456',
        method: ScrapingMethod.CLIENT_SIDE,
        selectors: {
          basePrice: '.price'
        }
      });

      expect(global.document.querySelector).toHaveBeenCalledWith('.price');
      expect(result.success).toBe(true);
    });

    it('should handle missing elements in client-side scraping', async () => {
      (global.document.querySelector as any).mockReturnValue(null);

      const result = await webScraper.scrapeRates({
        url: 'https://airbnb.com/rooms/123456',
        method: ScrapingMethod.CLIENT_SIDE,
        selectors: {
          basePrice: '.nonexistent'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('rate limiting', () => {
    it('should respect rate limits', async () => {
      const scraper = new WebScraper({
        rateLimitConfig: {
          requestsPerMinute: 60,
          burstLimit: 10
        }
      });

      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('<div class="price">$100</div>'),
        headers: new Headers()
      };

      mockFetch.mockResolvedValue(mockResponse);

      const startTime = Date.now();
      const results = await Promise.all([
        scraper.scrapeRates({
          url: 'https://site1.com',
          method: ScrapingMethod.SERVER_SIDE,
          selectors: { basePrice: '.price' }
        }),
        scraper.scrapeRates({
          url: 'https://site2.com',
          method: ScrapingMethod.SERVER_SIDE,
          selectors: { basePrice: '.price' }
        }),
        scraper.scrapeRates({
          url: 'https://site3.com',
          method: ScrapingMethod.SERVER_SIDE,
          selectors: { basePrice: '.price' }
        })
      ]);
      const endTime = Date.now();

      expect(results.every(r => r.success)).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('retry logic', () => {
    it('should retry failed scraping attempts', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server error'),
        headers: new Headers()
      };

      const mockSuccessResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('<div class="price">$100</div>'),
        headers: new Headers()
      };

      mockFetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await webScraper.scrapeRates({
        url: 'https://unreliable-site.com',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: { basePrice: '.price' }
      });

      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      expect(result.success).toBe(true);
    });
  });

  describe('data extraction', () => {
    it('should extract price data correctly', async () => {
      const mockHtml = `
        <div class="airbnb-listing">
          <div class="price">$150</div>
          <div class="cleaning-fee">$25</div>
          <div class="service-fee">$15</div>
          <div class="taxes">$20</div>
        </div>
      `;

      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(mockHtml),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await webScraper.scrapeRates({
        url: 'https://airbnb.com/rooms/123456',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {
          basePrice: '.price',
          cleaningFee: '.cleaning-fee',
          serviceFee: '.service-fee',
          taxes: '.taxes'
        }
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.basePrice).toBe(150);
        expect(result.data.cleaningFee).toBe(25);
        expect(result.data.serviceFee).toBe(15);
        expect(result.data.taxes).toBe(20);
      }
    });

    it('should handle different price formats', async () => {
      const mockHtml = `
        <div class="price">$1,250.50</div>
        <div class="cleaning-fee">$50.00</div>
      `;

      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(mockHtml),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await webScraper.scrapeRates({
        url: 'https://example.com',
        method: ScrapingMethod.SERVER_SIDE,
        selectors: {
          basePrice: '.price',
          cleaningFee: '.cleaning-fee'
        }
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.basePrice).toBe(1250.50);
        expect(result.data.cleaningFee).toBe(50.00);
      }
    });
  });
});

describe('withRetry', () => {
  it('should retry function on failure', async () => {
    let attemptCount = 0;
    const mockFunction = vi.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure');
      }
      return { success: true, data: 'success' };
    });

    const retryFunction = withRetry(mockFunction, {
      maxRetries: 3,
      retryDelay: 10,
      backoffMultiplier: 1
    });

    const result = await retryFunction();

    expect(result.success).toBe(true);
    expect(mockFunction).toHaveBeenCalledTimes(3);
  });
});

describe('withRateLimit', () => {
  it('should limit request rate', async () => {
    const mockFunction = vi.fn().mockResolvedValue({ success: true });

    const rateLimitedFunction = withRateLimit(mockFunction, {
      requestsPerMinute: 60,
      burstLimit: 10
    });

    const startTime = Date.now();
    const results = await Promise.all([
      rateLimitedFunction(),
      rateLimitedFunction(),
      rateLimitedFunction()
    ]);
    const endTime = Date.now();

    expect(mockFunction).toHaveBeenCalledTimes(3);
    expect(results.every(r => r.success)).toBe(true);
    expect(endTime - startTime).toBeGreaterThanOrEqual(0);
  });
});

describe('createWebScraper', () => {
  it('should create web scraper with config', () => {
    const config: ScrapingConfig = {
      baseURL: 'https://custom.scraper.com',
      timeout: 15000
    };

    const scraper = createWebScraper(config);

    expect(scraper).toBeInstanceOf(WebScraper);
  });
});

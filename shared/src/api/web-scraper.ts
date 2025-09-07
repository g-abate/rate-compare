/**
 * Web scraping utilities for rate comparison
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

import { errorHandler, createRateFetchingError } from '../utils/error-handler';

// Type definitions for fetch API
interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

/**
 * Scraping methods
 */
export enum ScrapingMethod {
  SERVER_SIDE = 'server_side',
  CLIENT_SIDE = 'client_side',
}

/**
 * Rate data extracted from scraping
 */
export interface ScrapedRateData {
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  otherFees?: number;
  totalPrice?: number;
  currency: string;
  availability: boolean;
  lastUpdated: string;
}

/**
 * CSS selectors for different platforms
 */
export interface ScrapingSelectors {
  basePrice: string;
  cleaningFee?: string;
  serviceFee?: string;
  taxes?: string;
  otherFees?: string;
  totalPrice?: string;
  availability?: string;
  currency?: string;
}

/**
 * Scraping request configuration
 */
export interface ScrapingRequest {
  url: string;
  method: ScrapingMethod;
  selectors: ScrapingSelectors;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Scraping result
 */
export interface ScrapingResult {
  success: boolean;
  data?: ScrapedRateData;
  error?: string;
  url?: string;
  timestamp: string;
}

/**
 * Scraping error details
 */
export interface ScrapingError {
  code: string;
  message: string;
  url?: string;
  selector?: string;
  context?: Record<string, unknown>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  burstLimit: number;
}

/**
 * Web scraper configuration
 */
export interface ScrapingConfig {
  baseURL?: string;
  timeout?: number;
  retryConfig?: RetryConfig;
  rateLimitConfig?: RateLimitConfig;
  userAgent?: string;
  headers?: Record<string, string>;
}

/**
 * Default scraping configuration
 */
const DEFAULT_CONFIG: ScrapingConfig = {
  baseURL: 'https://scraper.ratecompare.com',
  timeout: 10000,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  },
  rateLimitConfig: {
    requestsPerMinute: 30,
    burstLimit: 5,
  },
  userAgent: 'RateCompare/1.0.0 (Web Scraper)',
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
};

/**
 * Rate limiter class
 */
class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);

    // Check if we're at the limit
    if (this.requests.length >= this.config.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + 60000 - now;

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitIfNeeded();
      }
    }

    // Check burst limit
    const recentRequests = this.requests.filter(time => time > now - 1000);
    if (recentRequests.length >= this.config.burstLimit) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.waitIfNeeded();
    }

    // Add current request
    this.requests.push(now);
  }
}

/**
 * Web scraper class
 */
export class WebScraper {
  private config: ScrapingConfig;
  private rateLimiter: RateLimiter;

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (!this.config.rateLimitConfig) {
      throw new Error('Rate limit configuration is required');
    }
    this.rateLimiter = new RateLimiter(this.config.rateLimitConfig);
  }

  /**
   * Update scraper configuration
   */
  updateConfig(newConfig: Partial<ScrapingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (!this.config.rateLimitConfig) {
      throw new Error('Rate limit configuration is required');
    }
    this.rateLimiter = new RateLimiter(this.config.rateLimitConfig);
  }

  /**
   * Scrape rates from a single URL
   */
  async scrapeRates(request: ScrapingRequest): Promise<ScrapingResult> {
    const timestamp = new Date().toISOString();

    try {
      // Apply rate limiting
      await this.rateLimiter.waitIfNeeded();

      // Apply retry logic
      const retryFunction = withRetry(
        async () => {
          if (request.method === ScrapingMethod.SERVER_SIDE) {
            return await this.scrapeServerSide(request);
          } else {
            return await this.scrapeClientSide(request);
          }
        },
        this.config.retryConfig || { maxRetries: 3, retryDelay: 1000, backoffMultiplier: 2 }
      );

      const result = await retryFunction();

      return {
        ...result,
        url: request.url,
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown scraping error';

      errorHandler.logError(
        createRateFetchingError('Scraping failed', {
          url: request.url,
          method: request.method,
          error: errorMessage,
        })
      );

      return {
        success: false,
        error: errorMessage,
        url: request.url,
        timestamp,
      };
    }
  }

  /**
   * Scrape rates from multiple URLs
   */
  async scrapeMultipleRates(
    urls: string[],
    commonConfig: Omit<ScrapingRequest, 'url'>
  ): Promise<ScrapingResult[]> {
    const requests = urls.map(url => ({
      ...commonConfig,
      url,
    }));

    // Process requests with concurrency limit
    const results: ScrapingResult[] = [];
    const concurrency = 3; // Limit concurrent requests

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(request => this.scrapeRates(request)));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Server-side scraping using proxy service
   */
  private async scrapeServerSide(request: ScrapingRequest): Promise<ScrapingResult> {
    const proxyUrl = `${this.config.baseURL}/scrape`;

    const response = await this.makeRequest(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent || 'RateCompare/1.0.0',
        ...this.config.headers,
        ...request.headers,
      },
      body: JSON.stringify({
        url: request.url,
        selectors: request.selectors,
        timeout: request.timeout || this.config.timeout,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Server-side scraping failed');
    }

    try {
      const data = this.extractRateData(response.data, request.selectors);

      if (!data) {
        return {
          success: false,
          error: 'Failed to extract rate data from response',
        };
      }

      return {
        success: true,
        data,
        url: request.url,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to extract rate data from response';
      return {
        success: false,
        error: errorMessage,
        url: request.url,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Client-side scraping using DOM manipulation
   */
  private async scrapeClientSide(request: ScrapingRequest): Promise<ScrapingResult> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('Client-side scraping requires browser environment');
    }

    try {
      // Navigate to the URL (this would be handled by the browser)
      // For testing purposes, we'll simulate DOM access
      const data = this.extractRateDataFromDOM(request.selectors);

      if (!data) {
        throw new Error('Failed to extract rate data from DOM');
      }

      return {
        success: true,
        data,
        url: request.url,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Client-side scraping failed';
      return {
        success: false,
        error: errorMessage,
        url: request.url,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Extract rate data from HTML content
   */
  private extractRateData(html: string, selectors: ScrapingSelectors): ScrapedRateData | null {
    try {
      // Parse HTML and extract data using selectors
      const data: Partial<ScrapedRateData> = {
        currency: 'USD',
        availability: true,
        lastUpdated: new Date().toISOString(),
      };

      // Extract base price
      const basePriceMatch = this.extractPriceFromText(html, selectors.basePrice);
      if (basePriceMatch === null) {
        throw new Error(`Base price selector not found: ${selectors.basePrice}`);
      }
      data.basePrice = basePriceMatch;

      // Extract optional fees
      if (selectors.cleaningFee) {
        data.cleaningFee = this.extractPriceFromText(html, selectors.cleaningFee) || 0;
      }

      if (selectors.serviceFee) {
        data.serviceFee = this.extractPriceFromText(html, selectors.serviceFee) || 0;
      }

      if (selectors.taxes) {
        data.taxes = this.extractPriceFromText(html, selectors.taxes) || 0;
      }

      if (selectors.otherFees) {
        data.otherFees = this.extractPriceFromText(html, selectors.otherFees) || 0;
      }

      if (selectors.totalPrice) {
        data.totalPrice = this.extractPriceFromText(html, selectors.totalPrice);
      }

      // Calculate total if not provided
      if (!data.totalPrice) {
        data.totalPrice =
          (data.basePrice || 0) +
          (data.cleaningFee || 0) +
          (data.serviceFee || 0) +
          (data.taxes || 0) +
          (data.otherFees || 0);
      }

      // Extract currency
      if (selectors.currency) {
        const currencyMatch = this.extractTextFromSelector(html, selectors.currency);
        if (currencyMatch) {
          data.currency = this.normalizeCurrency(currencyMatch);
        }
      }

      // Extract availability
      if (selectors.availability) {
        const availabilityText = this.extractTextFromSelector(html, selectors.availability);
        data.availability = this.parseAvailability(availabilityText);
      }

      return data as ScrapedRateData;
    } catch (error) {
      errorHandler.logError(
        createRateFetchingError('Data extraction failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          selectors,
        })
      );
      throw error; // Re-throw the error so it can be caught by the calling method
    }
  }

  /**
   * Extract rate data from DOM (client-side)
   */
  private extractRateDataFromDOM(selectors: ScrapingSelectors): ScrapedRateData | null {
    try {
      const data: Partial<ScrapedRateData> = {
        currency: 'USD',
        availability: true,
        lastUpdated: new Date().toISOString(),
      };

      // Extract base price
      const basePriceElement = document.querySelector(selectors.basePrice);
      if (!basePriceElement) {
        throw new Error(`Base price element not found: ${selectors.basePrice}`);
      }
      data.basePrice = this.parsePrice(basePriceElement.textContent || '');

      // Extract optional fees
      if (selectors.cleaningFee) {
        const element = document.querySelector(selectors.cleaningFee);
        data.cleaningFee = element ? this.parsePrice(element.textContent || '') : 0;
      }

      if (selectors.serviceFee) {
        const element = document.querySelector(selectors.serviceFee);
        data.serviceFee = element ? this.parsePrice(element.textContent || '') : 0;
      }

      if (selectors.taxes) {
        const element = document.querySelector(selectors.taxes);
        data.taxes = element ? this.parsePrice(element.textContent || '') : 0;
      }

      if (selectors.otherFees) {
        const element = document.querySelector(selectors.otherFees);
        data.otherFees = element ? this.parsePrice(element.textContent || '') : 0;
      }

      if (selectors.totalPrice) {
        const element = document.querySelector(selectors.totalPrice);
        data.totalPrice = element ? this.parsePrice(element.textContent || '') : undefined;
      }

      // Calculate total if not provided
      if (!data.totalPrice) {
        data.totalPrice =
          (data.basePrice || 0) +
          (data.cleaningFee || 0) +
          (data.serviceFee || 0) +
          (data.taxes || 0) +
          (data.otherFees || 0);
      }

      // Extract currency
      if (selectors.currency) {
        const element = document.querySelector(selectors.currency);
        if (element) {
          data.currency = this.normalizeCurrency(element.textContent || '');
        }
      }

      // Extract availability
      if (selectors.availability) {
        const element = document.querySelector(selectors.availability);
        data.availability = this.parseAvailability(element?.textContent || '');
      }

      return data as ScrapedRateData;
    } catch (error) {
      errorHandler.logError(
        createRateFetchingError('DOM extraction failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          selectors,
        })
      );
      throw error; // Re-throw the error so it can be caught by the calling method
    }
  }

  /**
   * Extract price from HTML using selector
   */
  private extractPriceFromText(html: string, selector: string): number | null {
    const text = this.extractTextFromSelector(html, selector);
    return text ? this.parsePrice(text) : null;
  }

  /**
   * Extract text from HTML using CSS selector (simplified implementation)
   */
  private extractTextFromSelector(html: string, selector: string): string | null {
    // This is a simplified implementation
    // In a real implementation, you'd use a proper HTML parser like jsdom or cheerio

    // Handle different selector types
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      // More flexible regex to handle various HTML structures
      const patterns = [
        new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>([^<]*)</[^>]*>`, 'i'),
        new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>([^<]*?)</[^>]*>`, 'i'),
        new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>([^<]*?)</[^>]*>`, 'gis'),
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return null;
    } else if (selector.startsWith('#')) {
      const id = selector.substring(1);
      const regex = new RegExp(`<[^>]*id="[^"]*${id}[^"]*"[^>]*>([^<]*)</[^>]*>`, 'i');
      const match = html.match(regex);
      return match ? match[1].trim() : null;
    } else {
      // Element selector
      const regex = new RegExp(`<${selector}[^>]*>([^<]*)</${selector}>`, 'i');
      const match = html.match(regex);
      return match ? match[1].trim() : null;
    }
  }

  /**
   * Parse price from text
   */
  private parsePrice(text: string): number {
    // Remove currency symbols and commas, extract number
    const cleaned = text.replace(/[^\d.,]/g, '');
    const number = parseFloat(cleaned.replace(',', ''));
    return isNaN(number) ? 0 : number;
  }

  /**
   * Normalize currency code
   */
  private normalizeCurrency(currency: string): string {
    const normalized = currency.toUpperCase().trim();
    const currencyMap: Record<string, string> = {
      $: 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      USD: 'USD',
      EUR: 'EUR',
      GBP: 'GBP',
      JPY: 'JPY',
    };
    return currencyMap[normalized] || 'USD';
  }

  /**
   * Parse availability from text
   */
  private parseAvailability(text: string): boolean {
    const availableKeywords = ['available', 'book now', 'instant book', 'yes'];
    const unavailableKeywords = ['unavailable', 'booked', 'no', 'sold out'];

    const lowerText = text.toLowerCase();

    if (unavailableKeywords.some(keyword => lowerText.includes(keyword))) {
      return false;
    }

    return availableKeywords.some(keyword => lowerText.includes(keyword)) || true;
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private async makeRequest(
    url: string,
    options: RequestInit
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.text();
      return {
        success: true,
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown request error',
      };
    }
  }
}

/**
 * Retry wrapper for functions
 */
export function withRetry<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  config: RetryConfig
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt === config.maxRetries) {
          throw lastError;
        }

        const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Unknown error occurred during retry');
  };
}

/**
 * Rate limit wrapper for functions
 */
export function withRateLimit<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  config: RateLimitConfig
): (...args: T) => Promise<R> {
  const rateLimiter = new RateLimiter(config);

  return async (...args: T): Promise<R> => {
    await rateLimiter.waitIfNeeded();
    return await fn(...args);
  };
}

/**
 * Create web scraper instance
 */
export function createWebScraper(config?: Partial<ScrapingConfig>): WebScraper {
  return new WebScraper(config);
}

/**
 * Platform-specific selectors based on current website structures
 * Note: These selectors may change as websites update their structure
 */
export const PLATFORM_SELECTORS: Record<string, ScrapingSelectors> = {
  airbnb: {
    // Airbnb pricing elements (as of 2024)
    basePrice: '[data-testid="price"] span, ._1y74zjx span, ._14y1gc span',
    cleaningFee: '[data-testid="cleaning-fee"] span, ._1y74zjx span:contains("cleaning")',
    serviceFee: '[data-testid="service-fee"] span, ._1y74zjx span:contains("service")',
    taxes: '[data-testid="taxes"] span, ._1y74zjx span:contains("tax")',
    totalPrice: '[data-testid="total-price"] span, ._1y74zjx span:contains("total")',
    availability: '[data-testid="availability"] span, ._1y74zjx span:contains("available")',
    currency: '[data-testid="currency"] span, ._1y74zjx span[class*="currency"]',
  },
  vrbo: {
    basePrice: '.nightly-rate, .price-per-night, [data-testid="nightly-rate"]',
    cleaningFee: '.cleaning-fee, [data-testid="cleaning-fee"]',
    taxes: '.taxes, .tax-amount, [data-testid="taxes"]',
    fees: '.fees, .additional-fees, [data-testid="fees"]',
    totalPrice: '.total-price, .total-amount, [data-testid="total-price"]',
    availability: '.availability, .available-dates, [data-testid="availability"]',
    currency: '.currency, .price-currency, [data-testid="currency"]',
  },
  booking: {
    basePrice: '.bui-price-display__value, .prco-valign-middle-helper, [data-testid="price"]',
    taxes: '.taxes, .tax-amount, [data-testid="taxes"]',
    fees: '.fees, .additional-fees, [data-testid="fees"]',
    totalPrice: '.total-price, .total-amount, [data-testid="total-price"]',
    availability: '.availability, .available-dates, [data-testid="availability"]',
    currency: '.currency, .price-currency, [data-testid="currency"]',
  },
  expedia: {
    basePrice: '.uitk-price-display, .price-display, [data-testid="price"]',
    taxes: '.taxes, .tax-amount, [data-testid="taxes"]',
    fees: '.fees, .additional-fees, [data-testid="fees"]',
    totalPrice: '.total-price, .total-amount, [data-testid="total-price"]',
    availability: '.availability, .available-dates, [data-testid="availability"]',
    currency: '.currency, .price-currency, [data-testid="currency"]',
  },
};

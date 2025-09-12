/**
 * Airbnb scraper implementation based on real API structure
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

import { RateData } from '../data-models/rate-data';
import { createRateFetchingError } from '../utils/error-handler';

export interface AirbnbScraperConfig {
  baseURL?: string;
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  rateLimitConfig?: {
    requestsPerMinute: number;
    burstLimit: number;
    maxRequestsPerHour: number;
  };
  ethicalConfig?: {
    respectRobotsTxt: boolean;
    userAgentRotation: boolean;
    headerRotation: boolean;
    humanLikeDelays: boolean;
    requestDelay: {
      min: number;
      max: number;
    };
  };
  proxyConfig?: {
    enabled: boolean;
    rotationInterval: number;
    providers: string[];
  };
}

export interface AirbnbApiResponse {
  data: {
    presentation: {
      stayCheckout: {
        temporaryQuickPayData: {
          productPriceBreakdown: {
            priceBreakdown: {
              priceItems: Array<{
                localizedTitle: string;
                nestedPriceItems?: Array<{
                  localizedTitle: string;
                  total: {
                    amountFormatted: string;
                    amountMicros: string;
                    currency: string;
                  };
                }>;
                total: {
                  amountFormatted: string;
                  amountMicros: string;
                  currency: string;
                };
                type: string;
              }>;
              total: {
                localizedTitle: string;
                total: {
                  amountFormatted: string;
                  amountMicros: string;
                  currency: string;
                };
                type: string;
              } | null;
            };
          };
        };
      };
    };
  };
}

export interface ExtractedDates {
  checkIn: string;
  checkOut: string;
}

/**
 * User agent strings for rotation
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
];

/**
 * HTTP headers for different browsers
 */
const HEADER_SETS = [
  {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  },
  {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
  {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
];

export class AirbnbScraper {
  private config: Required<AirbnbScraperConfig>;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private currentUserAgent: string = '';
  private currentHeaders: Record<string, string> = {};
  private requestHistory: Array<{ timestamp: number; url: string }> = [];

  constructor(config: AirbnbScraperConfig = {}) {
    this.config = {
      baseURL: config.baseURL || 'https://www.airbnb.com',
      timeout: config.timeout || 30000,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 2000,
        backoffMultiplier: 2,
        ...config.retryConfig,
      },
      rateLimitConfig: {
        requestsPerMinute: 30,
        burstLimit: 5,
        maxRequestsPerHour: 100,
        ...config.rateLimitConfig,
      },
      ethicalConfig: {
        respectRobotsTxt: true,
        userAgentRotation: true,
        headerRotation: true,
        humanLikeDelays: true,
        requestDelay: {
          min: 5000,
          max: 15000,
        },
        ...config.ethicalConfig,
      },
      proxyConfig: {
        enabled: false,
        rotationInterval: 10,
        providers: [],
        ...config.proxyConfig,
      },
    };

    this.rotateUserAgent();
    this.rotateHeaders();
  }

  /**
   * Rotate user agent string
   */
  private rotateUserAgent(): void {
    if (this.config.ethicalConfig.userAgentRotation) {
      const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
      this.currentUserAgent = USER_AGENTS[randomIndex] || USER_AGENTS[0];
    } else {
      this.currentUserAgent = USER_AGENTS[0];
    }
  }

  /**
   * Rotate HTTP headers
   */
  private rotateHeaders(): void {
    if (this.config.ethicalConfig.headerRotation) {
      const headerSet = HEADER_SETS[Math.floor(Math.random() * HEADER_SETS.length)];
      this.currentHeaders = { ...headerSet };
    } else {
      this.currentHeaders = { ...HEADER_SETS[0] };
    }
  }

  /**
   * Calculate delay between requests
   */
  private calculateDelay(): number {
    const { min, max } = this.config.ethicalConfig.requestDelay;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Remove old requests from history
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > oneHourAgo);

    return this.requestHistory.length < this.config.rateLimitConfig.maxRequestsPerHour;
  }

  /**
   * Add request to history
   */
  private addRequestToHistory(url: string): void {
    this.requestHistory.push({
      timestamp: Date.now(),
      url: url,
    });
  }

  /**
   * Wait for rate limit compliance
   */
  private async waitForRateLimit(): Promise<void> {
    if (!this.checkRateLimit()) {
      const waitTime = 60 * 60 * 1000; // Wait 1 hour
      console.log(`⏳ Rate limit reached. Waiting ${waitTime / 1000 / 60} minutes...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Simulate human-like delay
   */
  private async humanDelay(): Promise<void> {
    if (this.config.ethicalConfig.humanLikeDelays) {
      const delay = this.calculateDelay();
      console.log(`⏳ Human-like delay: ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Check robots.txt compliance
   */
  async checkRobotsTxt(url: string): Promise<boolean> {
    if (!this.config.ethicalConfig.respectRobotsTxt) {
      return true;
    }

    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.currentUserAgent,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const robotsContent = await response.text();
        const content = robotsContent.toLowerCase();

        // Simple robots.txt parsing - in production, use a proper parser
        if (content.includes('user-agent: *') && content.includes('disallow:')) {
          console.log('⚠️  Robots.txt may restrict access');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.log('⚠️  Could not check robots.txt:', error);
      return true; // Assume allowed if we can't check
    }
  }

  /**
   * Extract property ID from Airbnb URL
   */
  extractPropertyId(url: string): string {
    const airbnbUrlPattern = /(?:https?:\/\/)?(?:www\.)?airbnb\.com\/rooms\/(\d+)/i;
    const match = url.match(airbnbUrlPattern);

    if (!match || !match[1]) {
      throw new Error('Invalid Airbnb property URL');
    }

    return match[1];
  }

  /**
   * Extract check-in and check-out dates from URL parameters
   */
  extractDatesFromUrl(url: string): ExtractedDates | null {
    const urlObj = new URL(url);
    const checkIn = urlObj.searchParams.get('check_in');
    const checkOut = urlObj.searchParams.get('check_out');

    if (!checkIn || !checkOut) {
      return null;
    }

    return { checkIn, checkOut };
  }

  /**
   * Fetch pricing data from Airbnb's stayCheckout API with ethical scraping
   */
  async fetchPricingData(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    adults: number = 1,
    children: number = 0,
    infants: number = 0,
    pets: number = 0
  ): Promise<Omit<RateData, 'channel' | 'propertyId' | 'checkIn' | 'checkOut'>> {
    // Check rate limits
    await this.waitForRateLimit();

    // Add human-like delay
    await this.humanDelay();

    // Rotate user agent and headers
    this.rotateUserAgent();
    this.rotateHeaders();
    const encodedPropertyId = btoa(`StayListing:${propertyId}`);

    const variables = {
      input: {
        businessTravel: { workTrip: false },
        checkinDate: checkIn,
        checkoutDate: checkOut,
        expectedPlacementType: 'WIDE',
        guestCounts: {
          numberOfAdults: adults,
          numberOfChildren: children,
          numberOfInfants: infants,
          numberOfPets: pets,
        },
        guestCurrencyOverride: 'USD',
        listingDetail: {},
        lux: {},
        metadata: {
          internalFlags: ['LAUNCH_LOGIN_PHONE_AUTH'],
        },
        org: {},
        productId: encodedPropertyId,
        addOn: {
          carbonOffsetParams: { isSelected: false },
        },
        quickPayData: null,
      },
    };

    const url = new URL(
      '/api/v3/stayCheckout/417c0620877e4b93402f5b88a2471ef8683a42b66775578dffee68ad9def7816',
      this.config.baseURL
    );
    url.searchParams.set('operationName', 'stayCheckout');
    url.searchParams.set('locale', 'en');
    url.searchParams.set('currency', 'USD');
    url.searchParams.set('variables', JSON.stringify(variables));
    url.searchParams.set(
      'extensions',
      JSON.stringify({
        persistedQuery: {
          version: 1,
          sha256Hash: '417c0620877e4b93402f5b88a2471ef8683a42b66775578dffee68ad9def7816',
        },
      })
    );

    // Add request to history
    this.addRequestToHistory(url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': this.currentUserAgent,
        Referer: 'https://www.airbnb.com/',
        Origin: 'https://www.airbnb.com',
        ...this.currentHeaders,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: AirbnbApiResponse = await response.json();

    if (!data?.data?.presentation?.stayCheckout) {
      throw new Error('Invalid API response structure');
    }

    return this.extractRateDataFromResponse(data);
  }

  /**
   * Extract rate data from API response
   */
  extractRateDataFromResponse(
    apiResponse: AirbnbApiResponse
  ): Omit<RateData, 'channel' | 'propertyId' | 'checkIn' | 'checkOut'> {
    const priceBreakdown =
      apiResponse.data.presentation.stayCheckout.temporaryQuickPayData.productPriceBreakdown
        .priceBreakdown;

    if (!priceBreakdown.priceItems || priceBreakdown.priceItems.length === 0) {
      throw new Error('No pricing data found');
    }

    let basePrice = 0;
    let serviceFee = 0;
    let taxes = 0;
    let cleaningFee = 0;
    let otherFees = 0;
    let totalPrice = 0;
    let currency = 'USD';

    // Extract pricing information from price items
    for (const item of priceBreakdown.priceItems) {
      if (item.type === 'ACCOMMODATION') {
        // Base price is in nested items
        if (item.nestedPriceItems) {
          for (const nestedItem of item.nestedPriceItems) {
            if (
              nestedItem.localizedTitle.includes('nights') &&
              !nestedItem.localizedTitle.includes('service fee')
            ) {
              basePrice = this.parseAmount(nestedItem.total.amountFormatted);
            } else if (nestedItem.localizedTitle.includes('service fee')) {
              serviceFee = this.parseAmount(nestedItem.total.amountFormatted);
            }
          }
        }
      } else if (item.type === 'TAXES') {
        taxes = this.parseAmount(item.total.amountFormatted);
      }
    }

    // Get total price
    if (priceBreakdown.total) {
      totalPrice = this.parseAmount(priceBreakdown.total.total.amountFormatted);
      currency = priceBreakdown.total.total.currency;
    }

    return {
      basePrice,
      fees: {
        cleaning: cleaningFee,
        service: serviceFee,
        taxes,
        other: otherFees,
      },
      totalPrice,
      currency,
      availability: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(amountString: string): number {
    // Remove currency symbols and commas, then parse
    const cleanAmount = amountString.replace(/[$,]/g, '');
    const amount = parseFloat(cleanAmount);

    if (isNaN(amount)) {
      throw new Error(`Invalid amount format: ${amountString}`);
    }

    return amount;
  }

  /**
   * Main scraping method that combines URL parsing and API fetching with ethical practices
   */
  async scrapeRates(
    propertyUrl: string,
    adults: number = 1,
    children: number = 0,
    infants: number = 0,
    pets: number = 0,
    checkIn?: string,
    checkOut?: string
  ): Promise<RateData> {
    try {
      // Check robots.txt compliance
      const robotsCompliant = await this.checkRobotsTxt(propertyUrl);
      if (!robotsCompliant) {
        throw new Error('Robots.txt restricts access to this URL');
      }

      // Extract property ID from URL
      const propertyId = this.extractPropertyId(propertyUrl);

      // Extract dates from URL or use provided dates
      let dates = this.extractDatesFromUrl(propertyUrl);
      if (!dates) {
        if (!checkIn || !checkOut) {
          throw new Error('Dates must be provided either in URL or as parameters');
        }
        dates = { checkIn, checkOut };
      }

      console.log(`🔍 Ethical scraping: ${propertyUrl} for ${dates.checkIn} to ${dates.checkOut}`);

      // Fetch pricing data
      const pricingData = await this.fetchPricingData(
        propertyId,
        dates.checkIn,
        dates.checkOut,
        adults,
        children,
        infants,
        pets
      );

      return {
        channel: 'airbnb',
        propertyId,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        ...pricingData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw createRateFetchingError(`Airbnb scraping failed: ${errorMessage}`, {
        propertyUrl,
        adults,
        children,
        infants,
        pets,
        checkIn,
        checkOut,
      });
    }
  }

  /**
   * Get scraping statistics
   */
  getStats(): {
    totalRequests: number;
    requestsThisHour: number;
    currentUserAgent: string;
    rateLimitStatus: {
      remaining: number;
      limit: number;
    };
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentRequests = this.requestHistory.filter(req => req.timestamp > oneHourAgo);

    return {
      totalRequests: this.requestHistory.length,
      requestsThisHour: recentRequests.length,
      currentUserAgent: this.currentUserAgent,
      rateLimitStatus: {
        remaining: this.config.rateLimitConfig.maxRequestsPerHour - recentRequests.length,
        limit: this.config.rateLimitConfig.maxRequestsPerHour,
      },
    };
  }
}

/**
 * Create a new Airbnb scraper instance
 */
export function createAirbnbScraper(config?: AirbnbScraperConfig): AirbnbScraper {
  return new AirbnbScraper(config);
}

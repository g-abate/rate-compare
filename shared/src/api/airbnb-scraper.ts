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

export class AirbnbScraper {
  private config: Required<AirbnbScraperConfig>;

  constructor(config: AirbnbScraperConfig = {}) {
    this.config = {
      baseURL: config.baseURL || 'https://www.airbnb.com',
      timeout: config.timeout || 10000,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        ...config.retryConfig,
      },
      rateLimitConfig: {
        requestsPerMinute: 60,
        burstLimit: 10,
        ...config.rateLimitConfig,
      },
    };
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
   * Fetch pricing data from Airbnb's stayCheckout API
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        Referer: 'https://www.airbnb.com/',
        Origin: 'https://www.airbnb.com',
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
   * Main scraping method that combines URL parsing and API fetching
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
}

/**
 * Create a new Airbnb scraper instance
 */
export function createAirbnbScraper(config?: AirbnbScraperConfig): AirbnbScraper {
  return new AirbnbScraper(config);
}

/**
 * Airbnb scraper tests based on real API structure
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AirbnbScraper } from '@/api/airbnb-scraper';
import { RateData } from '@/data-models/rate-data';

// Mock fetch globally
global.fetch = vi.fn();

describe('AirbnbScraper', () => {
  let scraper: AirbnbScraper;

  beforeEach(() => {
    scraper = new AirbnbScraper();
    vi.clearAllMocks();
  });

  describe('Property URL Parsing', () => {
    it('should extract property ID from Airbnb URL', () => {
      const url = 'https://www.airbnb.com/rooms/54334574?check_in=2025-10-03&check_out=2025-10-06';
      const propertyId = scraper.extractPropertyId(url);
      expect(propertyId).toBe('54334574');
    });

    it('should handle URLs with additional parameters', () => {
      const url = 'https://www.airbnb.com/rooms/12345678?search_mode=regular_search&adults=1&check_in=2025-10-16&source_impression_id=p3_1757197777_P372f9uxQ4QzBttn';
      const propertyId = scraper.extractPropertyId(url);
      expect(propertyId).toBe('12345678');
    });

    it('should throw error for invalid URLs', () => {
      const invalidUrl = 'https://www.airbnb.com/invalid-url';
      expect(() => scraper.extractPropertyId(invalidUrl)).toThrow('Invalid Airbnb property URL');
    });

    it('should handle mobile URLs', () => {
      const mobileUrl = 'https://airbnb.com/rooms/54334574';
      const propertyId = scraper.extractPropertyId(mobileUrl);
      expect(propertyId).toBe('54334574');
    });
  });

  describe('Date Extraction', () => {
    it('should extract dates from URL parameters', () => {
      const url = 'https://www.airbnb.com/rooms/54334574?check_in=2025-10-03&check_out=2025-10-06';
      const dates = scraper.extractDatesFromUrl(url);
      expect(dates).toEqual({
        checkIn: '2025-10-03',
        checkOut: '2025-10-06'
      });
    });

    it('should return null for URLs without dates', () => {
      const url = 'https://www.airbnb.com/rooms/54334574';
      const dates = scraper.extractDatesFromUrl(url);
      expect(dates).toBeNull();
    });

    it('should handle different date formats', () => {
      const url = 'https://www.airbnb.com/rooms/54334574?check_in=2025-12-25&check_out=2025-12-28';
      const dates = scraper.extractDatesFromUrl(url);
      expect(dates).toEqual({
        checkIn: '2025-12-25',
        checkOut: '2025-12-28'
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch pricing data from stayCheckout API', async () => {
      const mockResponse = {
        data: {
          presentation: {
            stayCheckout: {
              temporaryQuickPayData: {
                productPriceBreakdown: {
                  priceBreakdown: {
                    priceItems: [
                      {
                        localizedTitle: '3 nights x $447.42',
                        nestedPriceItems: [
                          {
                            localizedTitle: '3 nights · Oct 3 – 6',
                            total: {
                              amountFormatted: '$1,176.20',
                              amountMicros: '1176200000',
                              currency: 'USD'
                            }
                          },
                          {
                            localizedTitle: 'Airbnb service fee',
                            total: {
                              amountFormatted: '$166.05',
                              amountMicros: '166050000',
                              currency: 'USD'
                            }
                          }
                        ],
                        total: {
                          amountFormatted: '$1,342.25',
                          amountMicros: '1342250000',
                          currency: 'USD'
                        },
                        type: 'ACCOMMODATION'
                      },
                      {
                        localizedTitle: 'Taxes',
                        total: {
                          amountFormatted: '$167.91',
                          amountMicros: '167910000',
                          currency: 'USD'
                        },
                        type: 'TAXES'
                      }
                    ],
                    total: {
                      localizedTitle: 'Total',
                      total: {
                        amountFormatted: '$1,510.16',
                        amountMicros: '1510160000',
                        currency: 'USD'
                      },
                      type: 'TOTAL'
                    }
                  }
                }
              }
            }
          }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await scraper.fetchPricingData('54334574', '2025-10-03', '2025-10-06', 1, 0, 0, 0);
      
      expect(result).toEqual({
        basePrice: 1176.20,
        fees: {
          cleaning: 0,
          service: 166.05,
          taxes: 167.91,
          other: 0
        },
        totalPrice: 1510.16,
        currency: 'USD',
        availability: true,
        lastUpdated: expect.any(String)
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        scraper.fetchPricingData('54334574', '2025-10-03', '2025-10-06', 1, 0, 0, 0)
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null })
      });

      await expect(
        scraper.fetchPricingData('54334574', '2025-10-03', '2025-10-06', 1, 0, 0, 0)
      ).rejects.toThrow('Invalid API response structure');
    });
  });

  describe('Rate Data Extraction', () => {
    it('should extract rate data from API response', () => {
      const apiResponse = {
        data: {
          presentation: {
            stayCheckout: {
              temporaryQuickPayData: {
                productPriceBreakdown: {
                  priceBreakdown: {
                    priceItems: [
                      {
                        localizedTitle: '2 nights x $200.00',
                        nestedPriceItems: [
                          {
                            localizedTitle: '2 nights · Dec 25 – 27',
                            total: {
                              amountFormatted: '$400.00',
                              amountMicros: '400000000',
                              currency: 'USD'
                            }
                          },
                          {
                            localizedTitle: 'Airbnb service fee',
                            total: {
                              amountFormatted: '$50.00',
                              amountMicros: '50000000',
                              currency: 'USD'
                            }
                          }
                        ],
                        total: {
                          amountFormatted: '$450.00',
                          amountMicros: '450000000',
                          currency: 'USD'
                        },
                        type: 'ACCOMMODATION'
                      },
                      {
                        localizedTitle: 'Taxes',
                        total: {
                          amountFormatted: '$45.00',
                          amountMicros: '45000000',
                          currency: 'USD'
                        },
                        type: 'TAXES'
                      }
                    ],
                    total: {
                      localizedTitle: 'Total',
                      total: {
                        amountFormatted: '$495.00',
                        amountMicros: '495000000',
                        currency: 'USD'
                      },
                      type: 'TOTAL'
                    }
                  }
                }
              }
            }
          }
        }
      };

      const rateData = scraper.extractRateDataFromResponse(apiResponse);
      
      expect(rateData).toEqual({
        basePrice: 400.00,
        fees: {
          cleaning: 0,
          service: 50.00,
          taxes: 45.00,
          other: 0
        },
        totalPrice: 495.00,
        currency: 'USD',
        availability: true,
        lastUpdated: expect.any(String)
      });
    });

    it('should handle missing pricing data', () => {
      const apiResponse = {
        data: {
          presentation: {
            stayCheckout: {
              temporaryQuickPayData: {
                productPriceBreakdown: {
                  priceBreakdown: {
                    priceItems: [],
                    total: null
                  }
                }
              }
            }
          }
        }
      };

      expect(() => scraper.extractRateDataFromResponse(apiResponse)).toThrow('No pricing data found');
    });
  });

  describe('Complete Scraping Flow', () => {
    it('should scrape rates from property URL with dates', async () => {
      const mockResponse = {
        data: {
          presentation: {
            stayCheckout: {
              temporaryQuickPayData: {
                productPriceBreakdown: {
                  priceBreakdown: {
                    priceItems: [
                      {
                        localizedTitle: '3 nights x $447.42',
                        nestedPriceItems: [
                          {
                            localizedTitle: '3 nights · Oct 3 – 6',
                            total: {
                              amountFormatted: '$1,176.20',
                              amountMicros: '1176200000',
                              currency: 'USD'
                            }
                          },
                          {
                            localizedTitle: 'Airbnb service fee',
                            total: {
                              amountFormatted: '$166.05',
                              amountMicros: '166050000',
                              currency: 'USD'
                            }
                          }
                        ],
                        total: {
                          amountFormatted: '$1,342.25',
                          amountMicros: '1342250000',
                          currency: 'USD'
                        },
                        type: 'ACCOMMODATION'
                      },
                      {
                        localizedTitle: 'Taxes',
                        total: {
                          amountFormatted: '$167.91',
                          amountMicros: '167910000',
                          currency: 'USD'
                        },
                        type: 'TAXES'
                      }
                    ],
                    total: {
                      localizedTitle: 'Total',
                      total: {
                        amountFormatted: '$1,510.16',
                        amountMicros: '1510160000',
                        currency: 'USD'
                      },
                      type: 'TOTAL'
                    }
                  }
                }
              }
            }
          }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const url = 'https://www.airbnb.com/rooms/54334574?check_in=2025-10-03&check_out=2025-10-06';
      const result = await scraper.scrapeRates(url, 1, 0, 0, 0);
      
      expect(result).toEqual({
        channel: 'airbnb',
        propertyId: '54334574',
        checkIn: '2025-10-03',
        checkOut: '2025-10-06',
        basePrice: 1176.20,
        fees: {
          cleaning: 0,
          service: 166.05,
          taxes: 167.91,
          other: 0
        },
        totalPrice: 1510.16,
        currency: 'USD',
        availability: true,
        lastUpdated: expect.any(String)
      });
    });

    it('should handle URLs without dates by requiring them as parameters', async () => {
      const mockResponse = {
        data: {
          presentation: {
            stayCheckout: {
              temporaryQuickPayData: {
                productPriceBreakdown: {
                  priceBreakdown: {
                    priceItems: [
                      {
                        localizedTitle: '2 nights x $200.00',
                        nestedPriceItems: [
                          {
                            localizedTitle: '2 nights · Dec 25 – 27',
                            total: {
                              amountFormatted: '$400.00',
                              amountMicros: '400000000',
                              currency: 'USD'
                            }
                          }
                        ],
                        total: {
                          amountFormatted: '$400.00',
                          amountMicros: '400000000',
                          currency: 'USD'
                        },
                        type: 'ACCOMMODATION'
                      }
                    ],
                    total: {
                      localizedTitle: 'Total',
                      total: {
                        amountFormatted: '$400.00',
                        amountMicros: '400000000',
                        currency: 'USD'
                      },
                      type: 'TOTAL'
                    }
                  }
                }
              }
            }
          }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const url = 'https://www.airbnb.com/rooms/54334574';
      const result = await scraper.scrapeRates(url, 1, 0, 0, 0, '2025-12-25', '2025-12-27');
      
      expect(result.checkIn).toBe('2025-12-25');
      expect(result.checkOut).toBe('2025-12-27');
    });
  });
});
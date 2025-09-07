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

  describe('Ethical Scraping Configuration', () => {
    it('should initialize with default ethical configuration', () => {
      const scraper = new AirbnbScraper();
      const stats = scraper.getStats();
      
      expect(stats.totalRequests).toBe(0);
      expect(stats.requestsThisHour).toBe(0);
      expect(stats.rateLimitStatus.limit).toBe(100);
      expect(stats.rateLimitStatus.remaining).toBe(100);
      expect(stats.currentUserAgent).toBeTruthy();
    });

    it('should allow custom ethical configuration', () => {
      const customConfig = {
        ethicalConfig: {
          respectRobotsTxt: false,
          userAgentRotation: false,
          headerRotation: false,
          humanLikeDelays: false,
          requestDelay: {
            min: 1000,
            max: 2000,
          },
        },
        rateLimitConfig: {
          maxRequestsPerHour: 50,
        },
      };

      const scraper = new AirbnbScraper(customConfig);
      const stats = scraper.getStats();
      
      expect(stats.rateLimitStatus.limit).toBe(50);
    });

    it('should track request history', () => {
      const stats = scraper.getStats();
      expect(stats.totalRequests).toBe(0);
      
      // Simulate adding requests to history
      (scraper as any).addRequestToHistory('https://example.com');
      (scraper as any).addRequestToHistory('https://example2.com');
      
      const updatedStats = scraper.getStats();
      expect(updatedStats.totalRequests).toBe(2);
    });
  });

  describe('User Agent and Header Rotation', () => {
    it('should rotate user agents when enabled', () => {
      const scraper = new AirbnbScraper({
        ethicalConfig: {
          userAgentRotation: true,
        },
      });

      const userAgents = new Set();
      
      // Call rotateUserAgent multiple times
      for (let i = 0; i < 10; i++) {
        (scraper as any).rotateUserAgent();
        userAgents.add((scraper as any).currentUserAgent);
      }

      // Should have multiple different user agents
      expect(userAgents.size).toBeGreaterThan(1);
    });

    it('should use same user agent when rotation disabled', () => {
      const scraper = new AirbnbScraper({
        ethicalConfig: {
          userAgentRotation: false,
        },
      });

      const firstUserAgent = (scraper as any).currentUserAgent;
      
      // Call rotateUserAgent multiple times
      for (let i = 0; i < 5; i++) {
        (scraper as any).rotateUserAgent();
      }

      const lastUserAgent = (scraper as any).currentUserAgent;
      expect(firstUserAgent).toBe(lastUserAgent);
    });

    it('should rotate headers when enabled', () => {
      const scraper = new AirbnbScraper({
        ethicalConfig: {
          headerRotation: true,
        },
      });

      const headerSets = new Set();
      
      // Call rotateHeaders multiple times
      for (let i = 0; i < 10; i++) {
        (scraper as any).rotateHeaders();
        const headers = (scraper as any).currentHeaders;
        headerSets.add(JSON.stringify(headers));
      }

      // Should have multiple different header sets
      expect(headerSets.size).toBeGreaterThan(1);
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limits correctly', () => {
      const scraper = new AirbnbScraper({
        rateLimitConfig: {
          maxRequestsPerHour: 2,
        },
      });

      // Initially should be within limits
      expect((scraper as any).checkRateLimit()).toBe(true);

      // Add requests to reach limit
      (scraper as any).addRequestToHistory('https://example.com');
      (scraper as any).addRequestToHistory('https://example2.com');
      
      // Should exceed limit when exactly at limit (2 >= 2)
      expect((scraper as any).checkRateLimit()).toBe(false);

      // Add one more to exceed limit
      (scraper as any).addRequestToHistory('https://example3.com');
      
      // Should exceed limit
      expect((scraper as any).checkRateLimit()).toBe(false);
    });

    it('should filter old requests from history', () => {
      const scraper = new AirbnbScraper();
      
      // Add a request from 2 hours ago
      const oldRequest = {
        timestamp: Date.now() - (2 * 60 * 60 * 1000),
        url: 'https://old-request.com',
      };
      (scraper as any).requestHistory.push(oldRequest);

      // Add a recent request
      (scraper as any).addRequestToHistory('https://recent-request.com');

      // Check rate limit should filter out old request
      (scraper as any).checkRateLimit();
      
      const stats = scraper.getStats();
      expect(stats.requestsThisHour).toBe(1);
    });
  });

  describe('Human-like Delays', () => {
    it('should calculate random delays within range', () => {
      const scraper = new AirbnbScraper({
        ethicalConfig: {
          requestDelay: {
            min: 1000,
            max: 2000,
          },
        },
      });

      const delays = [];
      for (let i = 0; i < 10; i++) {
        delays.push((scraper as any).calculateDelay());
      }

      // All delays should be within range
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(1000);
        expect(delay).toBeLessThanOrEqual(2000);
      });

      // Should have some variation
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should not delay when human-like delays disabled', async () => {
      const scraper = new AirbnbScraper({
        ethicalConfig: {
          humanLikeDelays: false,
        },
      });

      const startTime = Date.now();
      await (scraper as any).humanDelay();
      const endTime = Date.now();

      // Should complete almost immediately
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Robots.txt Compliance', () => {
    it('should check robots.txt when enabled and return false for restrictions', async () => {
      const mockRobotsResponse = {
        ok: true,
        text: () => Promise.resolve('User-agent: *\nDisallow: /api/'),
      };

      (global.fetch as any).mockResolvedValueOnce(mockRobotsResponse);

      const scraper = new AirbnbScraper({
        ethicalConfig: {
          respectRobotsTxt: true,
        },
      });

      const result = await scraper.checkRobotsTxt('https://example.com');
      
      expect(result).toBe(false); // Should return false when restrictions found
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/robots.txt',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
          }),
        })
      );
    });

    it('should return true when no restrictions found', async () => {
      const mockRobotsResponse = {
        ok: true,
        text: () => Promise.resolve('User-agent: *\nAllow: /'),
      };

      (global.fetch as any).mockResolvedValueOnce(mockRobotsResponse);

      const scraper = new AirbnbScraper({
        ethicalConfig: {
          respectRobotsTxt: true,
        },
      });

      const result = await scraper.checkRobotsTxt('https://example.com');
      
      expect(result).toBe(true); // Should return true when no restrictions
    });

    it('should skip robots.txt check when disabled', async () => {
      const scraper = new AirbnbScraper({
        ethicalConfig: {
          respectRobotsTxt: false,
        },
      });

      const result = await scraper.checkRobotsTxt('https://example.com');
      
      expect(result).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle robots.txt fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const scraper = new AirbnbScraper({
        ethicalConfig: {
          respectRobotsTxt: true,
        },
      });

      const result = await scraper.checkRobotsTxt('https://example.com');
      
      // Should return true (assume allowed) when can't check
      expect(result).toBe(true);
    });
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
      // Disable human-like delays for testing
      const testScraper = new AirbnbScraper({
        ethicalConfig: {
          humanLikeDelays: false,
        },
      });
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

      const result = await testScraper.fetchPricingData('54334574', '2025-10-03', '2025-10-06', 1, 0, 0, 0);
      
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
      const testScraper = new AirbnbScraper({
        ethicalConfig: {
          humanLikeDelays: false,
        },
      });
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        testScraper.fetchPricingData('54334574', '2025-10-03', '2025-10-06', 1, 0, 0, 0)
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed API responses', async () => {
      const testScraper = new AirbnbScraper({
        ethicalConfig: {
          humanLikeDelays: false,
        },
      });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null })
      });

      await expect(
        testScraper.fetchPricingData('54334574', '2025-10-03', '2025-10-06', 1, 0, 0, 0)
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
      const testScraper = new AirbnbScraper({
        ethicalConfig: {
          humanLikeDelays: false,
          respectRobotsTxt: false, // Skip robots.txt for testing
        },
      });
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
      const result = await testScraper.scrapeRates(url, 1, 0, 0, 0);
      
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
      const testScraper = new AirbnbScraper({
        ethicalConfig: {
          humanLikeDelays: false,
          respectRobotsTxt: false, // Skip robots.txt for testing
        },
      });
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
      const result = await testScraper.scrapeRates(url, 1, 0, 0, 0, '2025-12-25', '2025-12-27');
      
      expect(result.checkIn).toBe('2025-12-25');
      expect(result.checkOut).toBe('2025-12-27');
    });
  });
});
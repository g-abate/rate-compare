/**
 * Browser-based Airbnb scraper using Puppeteer
 * 
 * This scraper opens a real browser and navigates to Airbnb pages
 * to extract accurate pricing data that's loaded via JavaScript.
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { RateData } from '../data-models/rate-data';

export interface BrowserScraperOptions {
  headless?: boolean;
  slowMo?: number;
  timeout?: number;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface ScrapingResult {
  propertyId: string;
  propertyUrl: string;
  checkIn: string;
  checkOut: string;
  rates: RateData[];
  scrapedAt: string;
  source: string;
}

export interface DetailedPricingData {
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  rawData: {
    accommodationSubtotal?: number;
    discountAmount?: number;
    longStayDiscount?: number;
    [key: string]: any;
  };
}

export interface ScrapingOptions {
  propertyUrl: string;
  checkIn: string;
  checkOut: string;
  propertyId?: string;
}

export class BrowserAirbnbScraper {
  private options: Required<BrowserScraperOptions>;
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(options: BrowserScraperOptions = {}) {
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 100,
      timeout: options.timeout || 30000,
      userAgent: options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: options.viewport || { width: 1366, height: 768 },
      ...options
    };
  }

  /**
   * Initialize browser and page
   */
  async init(): Promise<void> {
    console.log('🚀 Launching browser...');
    
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set user agent and viewport
    await this.page.setUserAgent(this.options.userAgent);
    await this.page.setViewport(this.options.viewport);
    
    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // Remove automation indicators
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Add some random delays to appear more human-like
    await this.page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    console.log('✅ Browser initialized successfully');
  }

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    console.log('🧹 Browser cleanup completed');
  }

  /**
   * Extract property ID from URL
   */
  private extractPropertyId(url: string): string {
    const match = url.match(/\/rooms\/(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Navigate to property page and set dates
   */
  private async navigateToProperty(options: ScrapingOptions): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    console.log(`🏠 Navigating to property: ${options.propertyUrl}`);
    
    // Navigate to the property page
    await this.page.goto(options.propertyUrl, { 
      waitUntil: 'networkidle2',
      timeout: this.options.timeout 
    });

    // Wait for the page to load
    await this.page.waitForTimeout(2000);

    // Try to set check-in date
    try {
      console.log(`📅 Setting check-in date: ${options.checkIn}`);
      await this.page.click('[data-testid="date-picker-checkin"]');
      await this.page.waitForTimeout(1000);
      
      // Click on the specific date
      const checkInSelector = `[data-testid="date-picker-day-${options.checkIn}"]`;
      await this.page.waitForSelector(checkInSelector, { timeout: 5000 });
      await this.page.click(checkInSelector);
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ Could not set check-in date, continuing...');
    }

    // Try to set check-out date
    try {
      console.log(`📅 Setting check-out date: ${options.checkOut}`);
      await this.page.click('[data-testid="date-picker-checkout"]');
      await this.page.waitForTimeout(1000);
      
      // Click on the specific date
      const checkOutSelector = `[data-testid="date-picker-day-${options.checkOut}"]`;
      await this.page.waitForSelector(checkOutSelector, { timeout: 5000 });
      await this.page.click(checkOutSelector);
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ Could not set check-out date, continuing...');
    }

    // Try to click Reserve button to get to booking page
    try {
      console.log('🔍 Looking for Reserve button...');
      const reserveButton = await this.page.waitForSelector('[data-testid="homes-pdp-cta"]', { timeout: 10000 });
      if (reserveButton) {
        await reserveButton.click();
        console.log('✅ Clicked Reserve button');
        await this.page.waitForTimeout(3000);
      }
    } catch (error) {
      console.log('⚠️ Could not find Reserve button, continuing with property page...');
    }
  }

  /**
   * Extract detailed pricing data from the page
   */
  private async extractDetailedPricingData(): Promise<DetailedPricingData> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    console.log('💰 Extracting detailed pricing data...');

    // Wait for pricing information to load
    const priceBreakdownSelectors = [
      '[data-testid="price-breakdown"]',
      '[data-testid="booking-summary"]',
      '[data-testid="pricing-summary"]',
      '[class*="total"]',
      '[class*="breakdown"]',
      '[class*="summary"]'
    ];

    let pricingElement = null;
    for (const selector of priceBreakdownSelectors) {
      try {
        pricingElement = await this.page.waitForSelector(selector, { timeout: 5000 });
        if (pricingElement) {
          console.log(`✅ Found pricing element with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!pricingElement) {
      console.log('⚠️ No pricing element found, trying fallback approach...');
    }

    // Extract pricing data using page.evaluate for more robust extraction
    const pricingData = await this.page.evaluate(() => {
      const data: DetailedPricingData = {
        basePrice: 0,
        cleaningFee: 0,
        serviceFee: 0,
        taxes: 0,
        totalPrice: 0,
        currency: 'USD',
        rawData: {}
      };

      // Look for elements containing pricing information
      const pricingDivs = Array.from(document.querySelectorAll('div')).filter(div => {
        const text = div.textContent || '';
        return text.includes('Price details') || 
               text.includes('Total USD') || 
               text.includes('nights x') || 
               text.includes('Taxes') ||
               text.includes('Service fee') ||
               text.includes('Cleaning fee');
      });

      console.log(`Found ${pricingDivs.length} potential pricing divs`);

      // Pattern matching for different pricing components
      const patterns = {
        accommodationSubtotal: /\$([\d,]+(?:\.\d{2})?)\s*(?=long|taxes|total)/i,
        discountPattern: /long\s+stay\s+discount\s*-?\$([\d,]+(?:\.\d{2})?)/i,
        accommodationPattern: /\$([\d,]+(?:\.\d{2})?)\s*(?=long|taxes|total)/i,
        cleaningFee: /cleaning\s+fee\s*\$([\d,]+(?:\.\d{2})?)/i,
        serviceFee: /service\s+fee\s*\$([\d,]+(?:\.\d{2})?)/i,
        taxes: /taxes\s*\$([\d,]+(?:\.\d{2})?)/i,
        total: /total\s+(?:usd\s+)?\$([\d,]+(?:\.\d{2})?)/i
      };

      // Extract values using patterns
      for (const div of pricingDivs) {
        const text = div.textContent || '';
        
        for (const [key, pattern] of Object.entries(patterns)) {
          const match = text.match(pattern);
          if (match) {
            const value = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(value)) {
              if (key === 'accommodationSubtotal') {
                data.rawData.accommodationSubtotal = value;
              } else if (key === 'discountPattern') {
                data.rawData.discountAmount = value;
              } else if (key === 'accommodationPattern') {
                data.rawData.accommodationSubtotal = value;
              } else if (key === 'cleaningFee') {
                data.cleaningFee = value;
              } else if (key === 'serviceFee') {
                data.serviceFee = value;
              } else if (key === 'taxes') {
                data.taxes = value;
              } else if (key === 'total') {
                data.totalPrice = value;
              }
            }
          }
        }
      }

      // Calculate base price from accommodation subtotal and discount
      if (data.rawData.accommodationSubtotal) {
        data.basePrice = data.rawData.accommodationSubtotal;
        if (data.rawData.discountAmount) {
          data.basePrice -= data.rawData.discountAmount;
        }
      }

      // Ensure service fee is not negative
      data.serviceFee = Math.max(0, data.serviceFee);

      // If we don't have a total, try to calculate it
      if (data.totalPrice === 0) {
        data.totalPrice = data.basePrice + data.cleaningFee + data.serviceFee + data.taxes;
      }

      return data;
    });

    console.log('📊 Extracted pricing data:', pricingData);
    return pricingData;
  }

  /**
   * Main scraping method
   */
  async scrapeRates(options: ScrapingOptions): Promise<ScrapingResult> {
    if (!this.browser || !this.page) {
      await this.init();
    }

    try {
      const propertyId = options.propertyId || this.extractPropertyId(options.propertyUrl);
      
      // Navigate to property and set dates
      await this.navigateToProperty(options);
      
      // Extract pricing data
      const pricingData = await this.extractDetailedPricingData();
      
      // Create rate data
      const rateData: RateData = {
        channel: 'airbnb',
        propertyId,
        checkIn: options.checkIn,
        checkOut: options.checkOut,
        basePrice: pricingData.basePrice,
        fees: {
          cleaning: pricingData.cleaningFee,
          service: pricingData.serviceFee,
          taxes: pricingData.taxes,
          other: 0
        },
        totalPrice: pricingData.totalPrice,
        currency: pricingData.currency,
        availability: true,
        lastUpdated: new Date().toISOString()
      };

      const result: ScrapingResult = {
        propertyId,
        propertyUrl: options.propertyUrl,
        checkIn: options.checkIn,
        checkOut: options.checkOut,
        rates: [rateData],
        scrapedAt: new Date().toISOString(),
        source: 'booking_page_detailed'
      };

      console.log('✅ Scraping completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    }
  }

  /**
   * Static method to scrape rates with automatic cleanup
   */
  static async scrapeRates(options: ScrapingOptions, scraperOptions?: BrowserScraperOptions): Promise<ScrapingResult> {
    const scraper = new BrowserAirbnbScraper(scraperOptions);
    try {
      return await scraper.scrapeRates(options);
    } finally {
      await scraper.cleanup();
    }
  }
}
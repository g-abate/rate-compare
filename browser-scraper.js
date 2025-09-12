#!/usr/bin/env node

/**
 * Browser-based Airbnb scraper using Puppeteer
 * 
 * This scraper opens a real browser and navigates to Airbnb pages
 * to extract accurate pricing data that's loaded via JavaScript.
 */

const puppeteer = require('puppeteer');

class BrowserAirbnbScraper {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false, // Default to headless
      slowMo: options.slowMo || 100, // Slow down operations for stability
      timeout: options.timeout || 30000,
      userAgent: options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: options.viewport || { width: 1366, height: 768 },
      ...options
    };
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser and page
   */
  async init() {
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
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    console.log('✅ Browser initialized');
  }

  /**
   * Extract property ID from Airbnb URL
   */
  extractPropertyId(url) {
    const airbnbUrlPattern = /(?:https?:\/\/)?(?:www\.)?airbnb\.com\/rooms\/(\d+)/i;
    const match = url.match(airbnbUrlPattern);
    
    if (!match || !match[1]) {
      throw new Error('Invalid Airbnb property URL');
    }
    
    return match[1];
  }

  /**
   * Navigate to Airbnb property page with dates
   */
  async navigateToProperty(propertyUrl, checkIn, checkOut) {
    const url = new URL(propertyUrl);
    url.searchParams.set('check_in', checkIn);
    url.searchParams.set('check_out', checkOut);
    url.searchParams.set('adults', '1');
    url.searchParams.set('children', '0');
    url.searchParams.set('infants', '0');

    console.log(`🌐 Navigating to: ${url.toString()}`);
    
    await this.page.goto(url.toString(), {
      waitUntil: 'networkidle2',
      timeout: this.options.timeout
    });

    // Wait for the page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Page loaded successfully');
  }

  /**
   * Click the Reserve button to navigate to booking page
   */
  async clickReserveButton() {
    console.log('🔘 Looking for Reserve button...');
    
    try {
      // Comprehensive list of Reserve button selectors based on the actual page
      const reserveButtonSelectors = [
        'button:has-text("Reserve")', // Most likely to work based on the screenshot
        'button[data-testid="reserve-button"]',
        'button[data-testid="sticky-footer"] button',
        'button:has-text("Reserve now")',
        'button:has-text("Book")',
        'button:has-text("Book now")',
        'button:has-text("Check availability")',
        '[data-testid="sticky-footer"] button[type="submit"]',
        'button[aria-label*="Reserve"]',
        'button[aria-label*="Book"]',
        'button[class*="reserve"]',
        'button[class*="book"]',
        'button[class*="checkout"]',
        'a[href*="checkout"]',
        'a[href*="reserve"]',
        '[role="button"]:has-text("Reserve")',
        '[role="button"]:has-text("Book")',
        'div[data-testid="sticky-footer"] button',
        'div[class*="sticky"] button',
        'div[class*="footer"] button'
      ];

      let reserveButton = null;
      let usedSelector = '';

      // Try each selector until we find one that works
      for (const selector of reserveButtonSelectors) {
        try {
          console.log(`🔍 Trying selector: ${selector}`);
          reserveButton = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (reserveButton) {
            usedSelector = selector;
            console.log(`✅ Found Reserve button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
          continue;
        }
      }

      if (!reserveButton) {
        // Last resort: look for any button with text containing "reserve" or "book"
        try {
          const buttonInfo = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a[role="button"], [role="button"]'));
            const buttonDetails = buttons.map(btn => ({
              tagName: btn.tagName,
              text: btn.textContent?.trim() || '',
              className: btn.className,
              id: btn.id,
              dataTestId: btn.getAttribute('data-testid'),
              ariaLabel: btn.getAttribute('aria-label'),
              href: btn.getAttribute('href'),
              visible: btn.offsetParent !== null
            }));
            
            const reserveButton = buttons.find(btn => {
              const text = btn.textContent?.toLowerCase() || '';
              return text.includes('reserve') || text.includes('book') || text.includes('check availability');
            });
            
            return {
              found: !!reserveButton,
              buttonDetails: buttonDetails,
              reserveButtonIndex: reserveButton ? buttons.indexOf(reserveButton) : -1
            };
          });
          
          console.log('🔍 All buttons found on page:');
          buttonInfo.buttonDetails.forEach((btn, index) => {
            if (btn.visible && btn.text) {
              console.log(`  ${index}: ${btn.tagName} - "${btn.text}" (class: ${btn.className}, testid: ${btn.dataTestId})`);
            }
          });
          
          if (buttonInfo.found) {
            console.log(`✅ Found Reserve button at index ${buttonInfo.reserveButtonIndex}`);
            reserveButton = await this.page.evaluateHandle((index) => {
              const buttons = Array.from(document.querySelectorAll('button, a[role="button"], [role="button"]'));
              return buttons[index];
            }, buttonInfo.reserveButtonIndex);
            
            if (reserveButton && reserveButton.asElement()) {
              usedSelector = 'text-based search';
              console.log('✅ Found Reserve button via text search');
            }
          }
        } catch (e) {
          console.log('⚠️  Text-based search failed:', e.message);
        }
      }

      if (!reserveButton) {
        throw new Error('No Reserve button found with any selector');
      }

      console.log(`✅ Found Reserve button with selector: ${usedSelector}`);
      
      // Interactive debugging - pause to let user inspect
      if (process.env.INTERACTIVE_DEBUG === 'true') {
        console.log('⏸️  PAUSED for interactive debugging. Check the browser window.');
        console.log('   Press Enter in the terminal to continue...');
        await new Promise(resolve => {
          process.stdin.once('data', () => resolve());
        });
      }
      
      console.log('🖱️  Clicking Reserve button...');
      
      // Handle different element types
      try {
        // First, ensure the button is visible and clickable
        await this.page.evaluate((element) => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, reserveButton);
        
        // Wait for the button to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try multiple clicking methods
        let clickSuccess = false;
        
        // Method 1: Direct element click
        try {
          if (reserveButton.asElement) {
            const element = reserveButton.asElement();
            if (element) {
              await element.click();
              clickSuccess = true;
            }
          } else {
            await reserveButton.click();
            clickSuccess = true;
          }
        } catch (e) {
          console.log('⚠️  Direct click failed, trying alternative methods...');
        }
        
        // Method 2: Mouse click with coordinates
        if (!clickSuccess) {
          try {
            const box = await reserveButton.boundingBox();
            if (box) {
              await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
              await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
              clickSuccess = true;
            }
          } catch (e) {
            console.log('⚠️  Mouse click failed, trying page.click()...');
          }
        }
        
        // Method 3: Page.click() with selector
        if (!clickSuccess) {
          try {
            await this.page.click(usedSelector);
            clickSuccess = true;
          } catch (e) {
            console.log('⚠️  Page.click() failed, trying evaluate click...');
          }
        }
        
        // Method 4: Evaluate click in browser context
        if (!clickSuccess) {
          try {
            await this.page.evaluate((element) => {
              element.click();
            }, reserveButton);
            clickSuccess = true;
          } catch (e) {
            throw new Error('All clicking methods failed');
          }
        }
        
        if (!clickSuccess) {
          throw new Error('Could not click the Reserve button');
        }
        
      } catch (clickError) {
        console.log('⚠️  All clicking methods failed:', clickError.message);
        throw clickError;
      }
      
      // Wait for navigation to booking page
      console.log('⏳ Waiting for navigation to booking page...');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      console.log('✅ Navigated to booking page');
      
      return true;
    } catch (error) {
      console.log('⚠️  Could not find or click Reserve button:', error.message);
      return false;
    }
  }

  /**
   * Extract detailed pricing data from the booking page API response
   */
  async extractDetailedPricingData() {
    console.log('🔍 Extracting detailed pricing data from booking page...');

    try {
      // Wait for the page to load and look for pricing elements
      // Updated selectors based on actual Airbnb booking page structure
      try {
        await this.page.waitForSelector('[data-testid="price-breakdown"], .price-breakdown, [class*="price"], [class*="total"], [class*="breakdown"], [class*="summary"]', { timeout: 15000 });
      } catch (e) {
        console.log('⚠️  Primary selectors failed, trying broader approach...');
        // Try to wait for any element that might contain pricing
        await this.page.waitForSelector('*', { timeout: 5000 });
      }
      
      // Extract pricing from the page content
      const pricingData = await this.page.evaluate(() => {
        const data = {
          basePrice: 0,
          cleaningFee: 0,
          serviceFee: 0,
          taxes: 0,
          totalPrice: 0,
          currency: 'USD',
          availability: true,
          rawData: {}
        };

        // Look for pricing breakdown elements - updated selectors based on actual page structure
        // Focus on right-hand side booking summary section with robust selectors
        const priceBreakdownSelectors = [
          // Data test IDs (most reliable)
          '[data-testid="booking-summary"]',
          '[data-testid="price-breakdown"]',
          '[data-testid="price-summary"]',
          '[data-testid="total-price"]',
          '[data-testid="booking-details"]',
          // Note: :has-text() is Playwright-specific, not valid CSS
          // We'll use content-based detection in the evaluation instead
          // Class patterns that are more likely to be stable
          '[class*="booking-summary"]',
          '[class*="price-breakdown"]',
          '[class*="pricing-summary"]',
          '[class*="booking-details"]',
          // General pricing selectors
          '[class*="price"]',
          '[class*="total"]',
          '[class*="breakdown"]',
          '[class*="summary"]',
          '[class*="booking"]',
          '[class*="checkout"]',
          '[class*="reservation"]'
        ];

        for (const selector of priceBreakdownSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            data.rawData[selector] = Array.from(elements).map(el => ({
              text: el.textContent,
              innerHTML: el.innerHTML
            }));
          }
        }

        // Debug: Log all elements that might contain pricing information
        const allElements = document.querySelectorAll('*');
        const pricingElements = Array.from(allElements).filter(el => {
          const text = el.textContent || '';
          const hasPrice = /\$[\d,]+(?:\.\d{2})?/.test(text);
          const hasPriceKeywords = /price|total|cost|amount|fee|tax|breakdown|summary/i.test(text);
          return hasPrice && hasPriceKeywords && text.length < 200; // Avoid very long text
        });

        data.rawData.pricingElements = pricingElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          text: el.textContent?.trim().substring(0, 100),
          id: el.id,
          dataTestId: el.getAttribute('data-testid')
        }));

        // Additional debugging: Log all elements with dollar amounts
        const allDollarElements = Array.from(allElements).filter(el => {
          const text = el.textContent || '';
          return /\$[\d,]+(?:\.\d{2})?/.test(text) && text.length < 100;
        });

        data.rawData.allDollarElements = allDollarElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          text: el.textContent?.trim(),
          id: el.id,
          dataTestId: el.getAttribute('data-testid')
        }));

        // Log page title and URL for debugging
        data.rawData.pageInfo = {
          title: document.title,
          url: window.location.href,
          bodyText: document.body.textContent.substring(0, 500)
        };

        // Specific approach: Look for the right-hand side booking summary
        // Try to find elements that contain the specific pricing text patterns
        let pricingDiv = null;
        let bookingSummaryText = '';
        
        // Look for elements that contain the key pricing text patterns
        const pricingTextPatterns = [
          'Price details',
          'Total USD',
          'nights x',
          'Taxes'
        ];
        
        // Try to find a div that contains multiple pricing patterns
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          const text = div.textContent || '';
          const patternMatches = pricingTextPatterns.filter(pattern => text.includes(pattern));
          
          // If this div contains multiple pricing patterns, it's likely our target
          if (patternMatches.length >= 2) {
            pricingDiv = div;
            bookingSummaryText = text;
            data.rawData.pricingDivFound = true;
            data.rawData.pricingDivContent = text;
            data.rawData.pricingDivClass = div.className;
            break;
          }
        }
        
        if (!pricingDiv) {
          // Fallback to full page text
          bookingSummaryText = document.body.textContent;
          data.rawData.pricingDivFound = false;
        }
        
        // Look for the specific patterns we can see in the booking page
        // These patterns are designed to be robust against minor text variations
        const specificPatterns = {
          // "5 nights x $559.18" pattern - handles various spacing and formatting
          nightsPattern: /(\d+)\s+nights?\s+x\s+\$([\d,]+(?:\.\d{2})?)/i,
          // "Taxes" with amount pattern - handles various spacing
          taxesPattern: /taxes?\s*\$([\d,]+(?:\.\d{2})?)/i,
          // "Total USD" pattern - handles various spacing and case
          totalPattern: /total\s+usd\s*\$([\d,]+(?:\.\d{2})?)/i,
          // Long stay discount pattern
          discountPattern: /long\s+stay\s+discount\s*-?\$([\d,]+(?:\.\d{2})?)/i,
          // Accommodation subtotal pattern (the amount after nights calculation)
          accommodationPattern: /\$([\d,]+(?:\.\d{2})?)\s*(?=long|taxes|total)/i,
          // Alternative patterns for different text formats
          subtotalPattern: /\$([\d,]+(?:\.\d{2})?)\s*$/m // For subtotal amounts
        };

        // Extract specific values from patterns
        const nightsMatch = bookingSummaryText.match(specificPatterns.nightsPattern);
        const taxesMatch = bookingSummaryText.match(specificPatterns.taxesPattern);
        const totalMatch = bookingSummaryText.match(specificPatterns.totalPattern);
        const discountMatch = bookingSummaryText.match(specificPatterns.discountPattern);
        const accommodationMatch = bookingSummaryText.match(specificPatterns.accommodationPattern);

        if (nightsMatch) {
          const nights = parseInt(nightsMatch[1]);
          const pricePerNight = parseFloat(nightsMatch[2].replace(/,/g, ''));
          data.basePrice = nights * pricePerNight;
          data.rawData.nightsExtraction = { nights, pricePerNight, total: data.basePrice };
        }

        // Handle accommodation subtotal (after nights calculation but before discount)
        if (accommodationMatch) {
          const accommodationSubtotal = parseFloat(accommodationMatch[1].replace(/,/g, ''));
          data.rawData.accommodationSubtotal = accommodationSubtotal;
        }

        // Handle long stay discount
        if (discountMatch) {
          const discountAmount = parseFloat(discountMatch[1].replace(/,/g, ''));
          data.rawData.discountAmount = discountAmount;
          // Apply discount to base price
          if (data.basePrice > 0) {
            data.basePrice = Math.max(0, data.basePrice - discountAmount);
          }
        }

        if (taxesMatch) {
          data.taxes = parseFloat(taxesMatch[1].replace(/,/g, ''));
          data.rawData.taxesExtraction = { amount: data.taxes };
        }

        if (totalMatch) {
          data.totalPrice = parseFloat(totalMatch[1].replace(/,/g, ''));
          data.rawData.totalExtraction = { amount: data.totalPrice };
        }

        // If we found specific values, calculate service fee as the difference
        if (data.basePrice > 0 && data.taxes > 0 && data.totalPrice > 0) {
          data.serviceFee = Math.max(0, data.totalPrice - data.basePrice - data.taxes);
          data.rawData.calculatedServiceFee = data.serviceFee;
          
          // Update the final values to use the extracted data
          data.basePrice = data.basePrice;
          data.taxes = data.taxes;
          data.totalPrice = data.totalPrice;
        }

        // Look for specific pricing patterns in the text
        const allText = document.body.textContent;
        
        // Find dollar amounts
        const dollarMatches = allText.match(/\$(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g);
        if (dollarMatches) {
          data.rawData.dollarAmounts = dollarMatches;
          
          // Parse and sort prices
          const prices = dollarMatches
            .map(match => parseFloat(match.replace(/[$,]/g, '')))
            .filter(price => !isNaN(price) && price > 0)
            .sort((a, b) => b - a);

          if (prices.length > 0) {
            // Use the highest reasonable price as total
            data.totalPrice = prices.find(p => p > 50 && p < 10000) || prices[0];
          }
        }

        // Look for specific fee labels with more detailed patterns based on the booking page
        // Updated patterns based on actual booking page structure
        const feePatterns = {
          // Base price patterns - specific to booking page format
          '\\d+\\s+nights?\\s+x\\s+\\$': 'basePrice', // "5 nights x $559.18"
          'nights?.*\\$': 'basePrice',
          'accommodation.*\\$': 'basePrice',
          'base.*\\$': 'basePrice',
          'subtotal.*\\$': 'basePrice',
          'room.*\\$': 'basePrice',
          'stay.*\\$': 'basePrice',
          
          // Service fee patterns
          'service fee.*\\$': 'serviceFee',
          'airbnb service fee.*\\$': 'serviceFee',
          'platform fee.*\\$': 'serviceFee',
          'host service fee.*\\$': 'serviceFee',
          'booking fee.*\\$': 'serviceFee',
          
          // Cleaning fee patterns
          'cleaning fee.*\\$': 'cleaningFee',
          'cleaning.*\\$': 'cleaningFee',
          'housekeeping.*\\$': 'cleaningFee',
          
          // Tax patterns - specific to booking page
          'taxes?.*\\$': 'taxes', // "Taxes" with "$343.50"
          'tax.*\\$': 'taxes',
          'occupancy.*\\$': 'taxes',
          'vat.*\\$': 'taxes',
          'city.*tax.*\\$': 'taxes',
          'local.*tax.*\\$': 'taxes',
          
          // Total patterns - specific to booking page format
          'total.*usd.*\\$': 'totalPrice', // "Total USD" with "$3,139.38"
          'total.*\\$': 'totalPrice',
          'grand total.*\\$': 'totalPrice',
          'final.*total.*\\$': 'totalPrice'
        };

        for (const [pattern, field] of Object.entries(feePatterns)) {
          const regex = new RegExp(`${pattern}[^$]*\\$([\\d,]+(?:\\.[\\d]{2})?)`, 'i');
          const match = allText.match(regex);
          if (match) {
            data[field] = parseFloat(match[1].replace(/,/g, ''));
          }
        }

        // If we found a total but no breakdown, estimate the components
        if (data.totalPrice > 0 && data.basePrice === 0) {
          data.basePrice = Math.round(data.totalPrice * 0.75);
          data.serviceFee = Math.round(data.totalPrice * 0.12);
          data.taxes = Math.round(data.totalPrice * 0.08);
          data.cleaningFee = Math.round(data.totalPrice * 0.05);
        }

        return data;
      });

      console.log('📊 Extracted detailed pricing data:', pricingData);
      return pricingData;

    } catch (error) {
      console.log('⚠️  Could not extract detailed pricing data:', error.message);
      throw error;
    }
  }

  /**
   * Extract pricing data from the loaded page (legacy method for property page)
   */
  async extractPricingData() {
    console.log('🔍 Extracting pricing data from property page...');

    try {
      // Wait for pricing elements to load - updated selectors
      await this.page.waitForSelector('[data-testid="price"], [class*="price"], [class*="total"], [class*="cost"], [class*="amount"]', { timeout: 10000 });
      
      // Extract pricing information using multiple selectors
      const pricingData = await this.page.evaluate(() => {
        const data = {
          basePrice: 0,
          cleaningFee: 0,
          serviceFee: 0,
          taxes: 0,
          totalPrice: 0,
          currency: 'USD',
          availability: true,
          rawData: {}
        };

        // Try to find pricing elements - updated selectors
        const priceSelectors = [
          '[data-testid="price"]',
          '[data-testid="price-breakdown"]',
          '[data-testid="total-price"]',
          '[data-testid="booking-summary"]',
          '.price-breakdown',
          '.pricing-summary',
          '[class*="price"]',
          '[class*="total"]',
          '[class*="cost"]',
          '[class*="amount"]',
          '[class*="booking"]',
          '[class*="reservation"]',
          '[class*="checkout"]'
        ];

        for (const selector of priceSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            data.rawData[selector] = Array.from(elements).map(el => ({
              text: el.textContent,
              innerHTML: el.innerHTML
            }));
          }
        }

        // Look for specific pricing patterns
        const allText = document.body.textContent;
        
        // Find dollar amounts
        const dollarMatches = allText.match(/\$(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g);
        if (dollarMatches) {
          data.rawData.dollarAmounts = dollarMatches;
          
          // Parse and sort prices
          const prices = dollarMatches
            .map(match => parseFloat(match.replace(/[$,]/g, '')))
            .filter(price => !isNaN(price) && price > 0)
            .sort((a, b) => b - a);

          if (prices.length > 0) {
            // Use the highest reasonable price as total
            data.totalPrice = prices.find(p => p > 50 && p < 10000) || prices[0];
            
            // Estimate base price (usually 70-80% of total)
            data.basePrice = Math.round(data.totalPrice * 0.75);
            
            // Estimate fees
            data.cleaningFee = Math.round(data.totalPrice * 0.15);
            data.serviceFee = Math.round(data.totalPrice * 0.12);
            data.taxes = Math.round(data.totalPrice * 0.08);
          }
        }

        // Look for specific fee labels
        const feeLabels = {
          'cleaning fee': 'cleaningFee',
          'service fee': 'serviceFee',
          'taxes': 'taxes',
          'total': 'totalPrice'
        };

        for (const [label, field] of Object.entries(feeLabels)) {
          const regex = new RegExp(`${label}[^$]*\\$([\\d,]+(?:\\.[\\d]{2})?)`, 'i');
          const match = allText.match(regex);
          if (match) {
            data[field] = parseFloat(match[1].replace(/,/g, ''));
          }
        }

        return data;
      });

      console.log('📊 Extracted pricing data:', pricingData);
      return pricingData;

    } catch (error) {
      console.log('⚠️  Could not extract pricing data:', error.message);
      
      // Fallback: try to get any pricing information
      const fallbackData = await this.page.evaluate(() => {
        const allText = document.body.textContent;
        const dollarMatches = allText.match(/\$(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g);
        
        if (dollarMatches) {
          const prices = dollarMatches
            .map(match => parseFloat(match.replace(/[$,]/g, '')))
            .filter(price => !isNaN(price) && price > 0)
            .sort((a, b) => b - a);

          if (prices.length > 0) {
            const totalPrice = prices[0];
            return {
              basePrice: Math.round(totalPrice * 0.75),
              cleaningFee: Math.round(totalPrice * 0.15),
              serviceFee: Math.round(totalPrice * 0.12),
              taxes: Math.round(totalPrice * 0.08),
              totalPrice: totalPrice,
              currency: 'USD',
              availability: true,
              note: 'Fallback extraction from page text'
            };
          }
        }
        
        return null;
      });

      if (fallbackData) {
        console.log('✅ Fallback data extracted:', fallbackData);
        return fallbackData;
      }

      throw new Error('Could not extract any pricing data from the page');
    }
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(filename = 'airbnb-scraper-debug.png') {
    if (this.page) {
      await this.page.screenshot({ 
        path: filename, 
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${filename}`);
    }
  }

  /**
   * Main scraping method with multi-step process
   */
  async scrapeRates(propertyUrl, checkIn, checkOut) {
    try {
      await this.init();
      await this.navigateToProperty(propertyUrl, checkIn, checkOut);
      
      // Take screenshot of property page for debugging
      await this.takeScreenshot('airbnb-property-page.png');
      
      // Try to click Reserve button and get detailed pricing
      let pricingData;
      let source = 'property_page_estimation';
      
      const reserveClicked = await this.clickReserveButton();
      
      if (reserveClicked) {
        try {
          // Take screenshot of booking page for debugging
          await this.takeScreenshot('airbnb-booking-page.png');
          
          // Extract detailed pricing from booking page
          pricingData = await this.extractDetailedPricingData();
          source = 'booking_page_detailed';
          console.log('✅ Successfully extracted detailed pricing from booking page');
        } catch (error) {
          console.log('⚠️  Failed to extract detailed pricing, falling back to property page estimation');
          // Navigate back to property page for fallback
          await this.navigateToProperty(propertyUrl, checkIn, checkOut);
          pricingData = await this.extractPricingData();
          source = 'property_page_fallback';
        }
      } else {
        // Fallback to property page pricing
        console.log('⚠️  Could not click Reserve button, using property page pricing');
        pricingData = await this.extractPricingData();
        source = 'property_page_only';
      }
      
      const propertyId = this.extractPropertyId(propertyUrl);

      return {
        propertyId,
        propertyUrl,
        checkIn,
        checkOut,
        rates: [{
          channel: 'airbnb',
          ...pricingData,
          lastUpdated: new Date().toISOString(),
          note: `Extracted via ${source}`,
          source: source
        }],
        scrapedAt: new Date().toISOString(),
        source: 'browser_automation'
      };

    } catch (error) {
      console.error('❌ Browser scraping failed:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Clean up browser resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

module.exports = { BrowserAirbnbScraper };

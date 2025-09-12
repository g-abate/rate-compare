/**
 * Universal Rate Comparison Snippet - Core Implementation
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

// Import local types
import type { RateData, SupportedChannel } from '../types/rate-data';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================


/**
 * Display modes for the rate comparison widget
 */
export type DisplayMode = 'inline' | 'floating';

/**
 * Theme options for the widget
 */
export type Theme = 'light' | 'dark';

/**
 * Event types that can be emitted by the snippet
 */
export type EventType = 'ready' | 'error' | 'rates-loaded' | 'teardown';

/**
 * Event handler function type
 */
export type EventHandler = (data?: any) => void;

/**
 * Configuration interface for the RateComparisonSnippet
 */
export interface RateComparisonConfig {
  /** Unique identifier for the property */
  propertyId: string;
  /** Array of booking channels to compare */
  channels: SupportedChannel[];
  /** Display mode for the widget */
  displayMode?: DisplayMode;
  /** Theme for the widget */
  theme?: Theme;
  /** Locale for internationalization */
  locale?: string;
}

/**
 * Theme configuration for CSS custom properties
 */
interface ThemeConfig {
  primary: string;
  background: string;
  text: string;
  border: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * List of supported booking channels
 */
const SUPPORTED_CHANNELS: readonly SupportedChannel[] = [
  'airbnb',
  'vrbo',
  'booking',
  'expedia',
] as const;

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  displayMode: 'inline' as const,
  theme: 'light' as const,
  locale: 'en-US',
} as const;

/**
 * Theme configurations for light and dark modes
 */
const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  light: {
    primary: '#000000',
    background: '#ffffff',
    text: '#000000',
    border: '#cccccc',
  },
  dark: {
    primary: '#ffffff',
    background: '#333333',
    text: '#ffffff',
    border: '#555555',
  },
} as const;

/**
 * CSS class names used by the widget
 */
const CSS_CLASSES = {
  WIDGET: 'rate-compare-widget',
  INLINE: 'rate-compare-inline',
  FLOATING: 'rate-compare-floating',
  THEME_PREFIX: 'rate-compare-theme-',
} as const;

/**
 * CSS custom property names
 */
const CSS_PROPERTIES = {
  PRIMARY: '--rate-compare-primary',
  BACKGROUND: '--rate-compare-background',
  TEXT: '--rate-compare-text',
  BORDER: '--rate-compare-border',
} as const;

// ============================================================================
// MAIN CLASS
// ============================================================================

/**
 * Universal Rate Comparison Snippet Class
 *
 * Provides a universal JavaScript snippet for rate comparison functionality
 * that can be embedded on any website without dependencies.
 *
 * @example
 * ```typescript
 * const snippet = new RateComparisonSnippet({
 *   propertyId: 'property-123',
 *   channels: ['airbnb', 'vrbo'],
 *   displayMode: 'inline',
 *   theme: 'light'
 * });
 *
 * await snippet.init();
 * ```
 */
export class RateComparisonSnippet {
  private config: Required<RateComparisonConfig>;
  private container: HTMLElement | null = null;
  private eventHandlers: Map<EventType, EventHandler[]> = new Map();
  private isInitialized = false;
  private rateData: RateData[] = [];
  private isLoading = false;

  /**
   * Creates a new RateComparisonSnippet instance
   *
   * @param config - Configuration object for the snippet
   * @throws {Error} When configuration is invalid
   */
  constructor(config: RateComparisonConfig) {
    // Validate configuration first
    this.validateConfig(config);

    // Store configuration with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Initialize event handlers map
    this.initializeEventHandlers();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Validates the configuration object
   *
   * @param config - Configuration to validate
   * @throws {Error} When configuration is invalid
   */
  private validateConfig(config: RateComparisonConfig): void {
    this.validatePropertyId(config.propertyId);
    this.validateChannels(config.channels);
  }

  /**
   * Validates the property ID
   *
   * @param propertyId - Property ID to validate
   * @throws {Error} When property ID is invalid
   */
  private validatePropertyId(propertyId: unknown): void {
    if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
      throw new Error('Property ID is required');
    }
  }

  /**
   * Validates the channels array
   *
   * @param channels - Channels array to validate
   * @throws {Error} When channels array is invalid
   */
  private validateChannels(channels: unknown): void {
    if (!Array.isArray(channels)) {
      throw new Error('Channels array is required');
    }

    if (channels.length === 0) {
      throw new Error('At least one channel is required');
    }

    // Validate each channel
    for (const channel of channels) {
      if (!SUPPORTED_CHANNELS.includes(channel as SupportedChannel)) {
        throw new Error(`Unsupported channel: ${channel}`);
      }
    }
  }

  /**
   * Initializes the event handlers map with empty arrays
   */
  private initializeEventHandlers(): void {
    const eventTypes: EventType[] = ['ready', 'error', 'rates-loaded', 'teardown'];
    eventTypes.forEach(eventType => {
      this.eventHandlers.set(eventType, []);
    });
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Initializes the snippet and creates the DOM elements
   *
   * @returns Promise that resolves when initialization is complete
   * @throws {Error} When initialization fails
   */
  public async init(): Promise<void> {
    try {
      // If already initialized, return early (idempotent)
      if (this.isInitialized) {
        return;
      }

      // Create container element
      this.createContainer();

      // Apply theme styles
      this.applyTheme();

      // Mark as initialized
      this.isInitialized = true;

      // Emit ready event
      this.emit('ready');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Creates the widget container element in the DOM
   */
  private createContainer(): void {
    // Remove existing container if it exists
    this.removeExistingContainer();

    // Inject CSS if not already injected
    this.injectCSS();

    // Create new container
    this.container = document.createElement('div');
    this.container.setAttribute('data-rate-compare', '');
    this.container.className = CSS_CLASSES.WIDGET;

    // Add display mode class
    this.addDisplayModeClass();

    // Add theme class
    this.addThemeClass();

    // Add to DOM
    document.body.appendChild(this.container);
  }

  /**
   * Removes existing container if it exists
   */
  private removeExistingContainer(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  /**
   * Injects CSS styles into the document head
   */
  private injectCSS(): void {
    // Check if CSS is already injected
    if (document.querySelector('#rate-compare-styles')) {
      return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = 'rate-compare-styles';
    style.textContent = this.getCSS();
    
    // Add to document head
    document.head.appendChild(style);
  }

  /**
   * Returns the CSS styles for the widget
   */
  private getCSS(): string {
    // In a real implementation, this would load from the CSS file
    // For now, we'll include the essential styles inline
    return `
      .rate-compare-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--rate-compare-text, #000000);
        background: var(--rate-compare-background, #ffffff);
        border: 1px solid var(--rate-compare-border, #cccccc);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 100%;
        box-sizing: border-box;
      }
      
      .rate-compare-inline {
        width: 100%;
        margin: 20px 0;
      }
      
      .rate-compare-floating {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        z-index: 1000;
      }
      
      .rate-compare-loading {
        padding: 20px;
        text-align: center;
        color: var(--rate-compare-text, #000000);
      }
      
      .rate-compare-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--rate-compare-border, #cccccc);
        border-top: 2px solid var(--rate-compare-primary, #000000);
        border-radius: 50%;
        animation: rate-compare-spin 1s linear infinite;
        margin: 0 auto 10px;
      }
      
      @keyframes rate-compare-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .rate-compare-error {
        padding: 20px;
        text-align: center;
        color: #dc3545;
      }
      
      .rate-compare-error p {
        margin: 0 0 15px 0;
      }
      
      .rate-compare-retry {
        background: var(--rate-compare-primary, #000000);
        color: var(--rate-compare-background, #ffffff);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;
      }
      
      .rate-compare-retry:hover {
        opacity: 0.8;
      }
      
      .rate-compare-results {
        padding: 20px;
      }
      
      .rate-compare-results h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--rate-compare-text, #000000);
      }
      
      .rate-compare-rates {
        display: grid;
        gap: 15px;
      }
      
      .rate-compare-card {
        border: 1px solid var(--rate-compare-border, #cccccc);
        border-radius: 6px;
        padding: 15px;
        background: var(--rate-compare-background, #ffffff);
        transition: box-shadow 0.2s;
      }
      
      .rate-compare-card:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .rate-compare-channel {
        font-weight: 600;
        text-transform: capitalize;
        margin-bottom: 8px;
        color: var(--rate-compare-primary, #000000);
      }
      
      .rate-compare-price {
        font-size: 20px;
        font-weight: 700;
        color: var(--rate-compare-primary, #000000);
        margin-bottom: 10px;
      }
      
      .rate-compare-breakdown {
        font-size: 12px;
        color: #666666;
        margin-bottom: 10px;
      }
      
      .rate-compare-base {
        margin-bottom: 5px;
      }
      
      .rate-compare-fees {
        margin-left: 10px;
      }
      
      .rate-compare-fees div {
        margin-bottom: 2px;
      }
      
      .rate-compare-availability {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 10px;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      
      .rate-compare-availability.available {
        background: #d4edda;
        color: #155724;
      }
      
      .rate-compare-availability.unavailable {
        background: #f8d7da;
        color: #721c24;
      }
      
      .rate-compare-book {
        display: inline-block;
        background: var(--rate-compare-primary, #000000);
        color: var(--rate-compare-background, #ffffff);
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s;
      }
      
      .rate-compare-book:hover {
        opacity: 0.8;
        text-decoration: none;
        color: var(--rate-compare-background, #ffffff);
      }
      
      .rate-compare-theme-dark {
        --rate-compare-primary: #ffffff;
        --rate-compare-background: #333333;
        --rate-compare-text: #ffffff;
        --rate-compare-border: #555555;
      }
      
      .rate-compare-theme-light {
        --rate-compare-primary: #000000;
        --rate-compare-background: #ffffff;
        --rate-compare-text: #000000;
        --rate-compare-border: #cccccc;
      }
      
      @media (max-width: 768px) {
        .rate-compare-floating {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
        }
      }
    `;
  }

  /**
   * Adds the appropriate display mode class to the container
   */
  private addDisplayModeClass(): void {
    if (!this.container) return;

    const displayModeClass =
      this.config.displayMode === 'inline' ? CSS_CLASSES.INLINE : CSS_CLASSES.FLOATING;

    this.container.classList.add(displayModeClass);
  }

  /**
   * Adds the appropriate theme class to the container
   */
  private addThemeClass(): void {
    if (!this.container) return;

    const themeClass = `${CSS_CLASSES.THEME_PREFIX}${this.config.theme}`;
    this.container.classList.add(themeClass);
  }

  /**
   * Applies theme styles using CSS custom properties
   */
  private applyTheme(): void {
    if (!this.container) return;

    const themeConfig = THEME_CONFIGS[this.config.theme];

    // Set CSS custom properties
    this.container.style.setProperty(CSS_PROPERTIES.PRIMARY, themeConfig.primary);
    this.container.style.setProperty(CSS_PROPERTIES.BACKGROUND, themeConfig.background);
    this.container.style.setProperty(CSS_PROPERTIES.TEXT, themeConfig.text);
    this.container.style.setProperty(CSS_PROPERTIES.BORDER, themeConfig.border);
  }

  /**
   * Adds an event listener for the specified event type
   *
   * @param event - The event type to listen for
   * @param handler - The function to call when the event is emitted
   */
  public on(event: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Removes an event listener for the specified event type
   *
   * @param event - The event type to remove the listener from
   * @param handler - The function to remove from the event listeners
   */
  public off(event: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Updates the configuration with new values
   *
   * @param newConfig - Partial configuration object with new values
   */
  public configure(newConfig: Partial<RateComparisonConfig>): void {
    // Merge new config with existing
    this.config = { ...this.config, ...newConfig };

    // Re-apply theme if it changed
    if (newConfig.theme && this.isInitialized) {
      this.applyTheme();
    }
  }

  /**
   * Cleans up and removes the snippet from the DOM
   */
  public teardown(): void {
    // Remove container from DOM
    this.removeExistingContainer();

    // Clear event handlers
    this.eventHandlers.clear();
    this.initializeEventHandlers();

    // Reset initialization state
    this.isInitialized = false;

    // Emit teardown event
    this.emit('teardown');
  }

  // ============================================================================
  // RATE FETCHING
  // ============================================================================

  /**
   * Fetches rates for the configured property and channels
   *
   * @param checkIn - Check-in date (ISO string)
   * @param checkOut - Check-out date (ISO string)
   * @returns Promise that resolves with rate data
   */
  public async fetchRates(checkIn: string, checkOut: string): Promise<RateData[]> {
    if (this.isLoading) {
      throw new Error('Rate fetching already in progress');
    }

    try {
      this.isLoading = true;
      this.showLoadingState();

      // Validate dates
      this.validateDates(checkIn, checkOut);

      // Check cache first
      const cachedRates = this.getCachedRates(checkIn, checkOut);
      if (cachedRates.length > 0) {
        this.rateData = cachedRates;
        this.displayRates();
        this.emit('rates-loaded', this.rateData);
        return this.rateData;
      }

      // Fetch rates from channels
      const rates = await this.fetchRatesFromChannels(checkIn, checkOut);

      // Cache the results
      this.cacheRates(checkIn, checkOut, rates);

      // Store and display
      this.rateData = rates;
      this.displayRates();
      this.emit('rates-loaded', this.rateData);

      return rates;
    } catch (error) {
      this.showErrorState(error as Error);
      this.emit('error', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Validates check-in and check-out dates
   */
  private validateDates(checkIn: string, checkOut: string): void {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime())) {
      throw new Error('Invalid check-in date');
    }

    if (isNaN(checkOutDate.getTime())) {
      throw new Error('Invalid check-out date');
    }

    if (checkInDate < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be after check-in date');
    }
  }

  /**
   * Fetches rates from configured channels
   */
  private async fetchRatesFromChannels(checkIn: string, checkOut: string): Promise<RateData[]> {
    const rates: RateData[] = [];

    for (const channel of this.config.channels) {
      try {
        const channelRates = await this.fetchChannelRates(channel, checkIn, checkOut);
        rates.push(...channelRates);
      } catch (error) {
        console.warn(`Failed to fetch rates from ${channel}:`, error);
        // Continue with other channels
      }
    }

    return rates;
  }

  /**
   * Fetches rates from a specific channel
   */
  private async fetchChannelRates(channel: SupportedChannel, checkIn: string, checkOut: string): Promise<RateData[]> {
    // Use server-side API for rate fetching
    // This is more appropriate for a universal snippet that runs in browsers
    
    try {
      const response = await fetch('/api/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: this.config.propertyId,
          channel,
          checkIn,
          checkOut,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.rates || [];
    } catch (error) {
      console.warn(`Failed to fetch rates from ${channel}:`, error);
      
      // Fallback to mock data for demo purposes
      return this.getMockRates(channel, checkIn, checkOut);
    }
  }

  /**
   * Returns mock rate data for demo purposes
   */
  private getMockRates(channel: SupportedChannel, checkIn: string, checkOut: string): RateData[] {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate mock pricing based on channel and dates
    const basePrices: Record<SupportedChannel, number> = {
      airbnb: 150,
      vrbo: 140,
      booking: 160,
      expedia: 155,
    };

    const basePrice = basePrices[channel] * nights;
    const cleaningFee = 50;
    const serviceFee = basePrice * 0.12; // 12% service fee
    const taxes = basePrice * 0.08; // 8% tax
    
    return [{
      channel,
      propertyId: this.config.propertyId,
      checkIn,
      checkOut,
      basePrice,
      fees: {
        cleaning: cleaningFee,
        service: serviceFee,
        taxes,
        other: 0,
      },
      totalPrice: basePrice + cleaningFee + serviceFee + taxes,
      currency: 'USD',
      availability: true,
      lastUpdated: new Date().toISOString(),
    }];
  }

  /**
   * Gets cached rates if available and not expired
   */
  private getCachedRates(checkIn: string, checkOut: string): RateData[] {
    try {
      const cacheKey = this.getCacheKey(checkIn, checkOut);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return [];

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - timestamp;
      const cacheTTL = 15 * 60 * 1000; // 15 minutes

      if (cacheAge > cacheTTL) {
        localStorage.removeItem(cacheKey);
        return [];
      }

      return data;
    } catch (error) {
      console.warn('Failed to read cached rates:', error);
      return [];
    }
  }

  /**
   * Caches rate data
   */
  private cacheRates(checkIn: string, checkOut: string, rates: RateData[]): void {
    try {
      const cacheKey = this.getCacheKey(checkIn, checkOut);
      const cacheData = {
        data: rates,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache rates:', error);
    }
  }

  /**
   * Generates cache key for rate data
   */
  private getCacheKey(checkIn: string, checkOut: string): string {
    return `rate-compare:${this.config.propertyId}:${checkIn}:${checkOut}`;
  }

  /**
   * Shows loading state in the widget
   */
  private showLoadingState(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="rate-compare-loading">
        <div class="rate-compare-spinner"></div>
        <p>Fetching rates...</p>
      </div>
    `;
  }

  /**
   * Shows error state in the widget
   */
  private showErrorState(error: Error): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="rate-compare-error">
        <p>Failed to fetch rates: ${error.message}</p>
        <button class="rate-compare-retry">Retry</button>
      </div>
    `;

    // Add retry functionality
    const retryButton = this.container.querySelector('.rate-compare-retry');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        // This would need to be implemented with date selection
        console.log('Retry clicked - date selection needed');
      });
    }
  }

  /**
   * Displays fetched rates in the widget
   */
  private displayRates(): void {
    if (!this.container || this.rateData.length === 0) return;

    const ratesHtml = this.rateData
      .map(rate => this.createRateCard(rate))
      .join('');

    this.container.innerHTML = `
      <div class="rate-compare-results">
        <h3>Rate Comparison</h3>
        <div class="rate-compare-rates">
          ${ratesHtml}
        </div>
      </div>
    `;
  }

  /**
   * Creates HTML for a single rate card
   */
  private createRateCard(rate: RateData): string {
    return `
      <div class="rate-compare-card">
        <div class="rate-compare-channel">${rate.channel}</div>
        <div class="rate-compare-price">$${rate.totalPrice.toFixed(2)}</div>
        <div class="rate-compare-breakdown">
          <div class="rate-compare-base">Base: $${rate.basePrice.toFixed(2)}</div>
          <div class="rate-compare-fees">
            <div>Cleaning: $${rate.fees.cleaning.toFixed(2)}</div>
            <div>Service: $${rate.fees.service.toFixed(2)}</div>
            <div>Taxes: $${rate.fees.taxes.toFixed(2)}</div>
          </div>
        </div>
        <div class="rate-compare-availability ${rate.availability ? 'available' : 'unavailable'}">
          ${rate.availability ? 'Available' : 'Not Available'}
        </div>
        <a href="#" class="rate-compare-book" target="_blank" rel="noopener noreferrer">
          Book on ${rate.channel}
        </a>
      </div>
    `;
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Emits an event to all registered handlers
   *
   * @param event - The event type to emit
   * @param data - Optional data to pass to event handlers
   */
  private emit(event: EventType, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}

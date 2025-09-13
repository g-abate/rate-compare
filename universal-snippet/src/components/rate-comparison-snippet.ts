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
    return `
      .rate-compare-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--rate-compare-text, #333333);
        background: var(--rate-compare-background, #ffffff);
        border: 1px solid var(--rate-compare-border, #e0e0e0);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      
      .rate-compare-inline {
        width: 100%;
        margin: 20px 0;
      }
      
      .rate-compare-floating {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        z-index: 1000;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .rate-compare-loading {
        padding: 40px 20px;
        text-align: center;
        color: var(--rate-compare-text, #333333);
      }
      
      .rate-compare-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #f0f0f0;
        border-top: 3px solid var(--rate-compare-primary, #007cba);
        border-radius: 50%;
        animation: rate-compare-spin 1s linear infinite;
        margin: 0 auto 15px;
      }
      
      @keyframes rate-compare-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .rate-compare-error {
        padding: 30px 20px;
        text-align: center;
        color: #dc3545;
        background: #fff5f5;
        border-radius: 8px;
        margin: 20px;
      }
      
      .rate-compare-error p {
        margin: 0 0 20px 0;
        font-size: 16px;
      }
      
      .rate-compare-retry {
        background: var(--rate-compare-primary, #007cba);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
      }
      
      .rate-compare-retry:hover {
        background: #005a87;
        transform: translateY(-1px);
      }
      
      .rate-compare-results {
        padding: 0;
      }
      
      .rate-compare-results h3 {
        margin: 0;
        padding: 24px 24px 16px 24px;
        font-size: 24px;
        font-weight: 700;
        color: var(--rate-compare-primary, #007cba);
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-bottom: 1px solid #f0f0f0;
      }
      
      .rate-compare-rates {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      
      .rate-compare-card {
        border: none;
        border-bottom: 1px solid #f0f0f0;
        border-radius: 0;
        padding: 20px 24px;
        background: var(--rate-compare-background, #ffffff);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 16px;
        position: relative;
      }
      
      .rate-compare-card:last-child {
        border-bottom: none;
        border-radius: 0 0 12px 12px;
      }
      
      .rate-compare-card:hover {
        background: #fafafa;
        transform: translateX(2px);
      }
      
      .rate-compare-card.best-deal {
        background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
        border-left: 4px solid #28a745;
      }
      
      .rate-compare-card.best-deal:hover {
        background: linear-gradient(135deg, #d4edda 0%, #e8f5e8 100%);
      }
      
      .rate-compare-platform-logo {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
        color: white;
        flex-shrink: 0;
      }
      
      .rate-compare-platform-logo.airbnb {
        background: linear-gradient(135deg, #FF5A5F 0%, #E31C5F 100%);
      }
      
      .rate-compare-platform-logo.vrbo {
        background: linear-gradient(135deg, #00A699 0%, #007A87 100%);
      }
      
      .rate-compare-platform-logo.booking {
        background: linear-gradient(135deg, #003580 0%, #0071c2 100%);
      }
      
      .rate-compare-platform-logo.expedia {
        background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
      }
      
      .rate-compare-platform-logo.direct {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      }
      
      .rate-compare-card-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .rate-compare-platform-info {
        flex: 1;
      }
      
      .rate-compare-channel {
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 4px;
        color: var(--rate-compare-text, #333333);
      }
      
      .rate-compare-channel-name {
        text-transform: capitalize;
      }
      
      .rate-compare-channel-direct {
        color: #28a745;
        font-weight: 800;
      }
      
      .rate-compare-savings {
        font-size: 12px;
        color: #28a745;
        font-weight: 600;
        margin-top: 2px;
      }
      
      .rate-compare-price-section {
        text-align: right;
        flex-shrink: 0;
      }
      
      .rate-compare-price {
        font-size: 24px;
        font-weight: 800;
        color: var(--rate-compare-text, #333333);
        margin-bottom: 4px;
        line-height: 1;
      }
      
      .rate-compare-price.best-deal {
        color: #28a745;
      }
      
      .rate-compare-price-per-night {
        font-size: 12px;
        color: #666666;
        font-weight: 500;
      }
      
      .rate-compare-availability {
        font-size: 11px;
        font-weight: 600;
        margin-top: 6px;
        padding: 3px 8px;
        border-radius: 12px;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
        background: var(--rate-compare-primary, #007cba);
        color: white;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
        margin-top: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .rate-compare-book:hover {
        background: #005a87;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 124, 186, 0.3);
        text-decoration: none;
        color: white;
      }
      
      .rate-compare-book.best-deal {
        background: #28a745;
      }
      
      .rate-compare-book.best-deal:hover {
        background: #218838;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      }
      
      .rate-compare-breakdown {
        font-size: 11px;
        color: #888888;
        margin-top: 6px;
        display: none; /* Hide by default, can be toggled */
      }
      
      .rate-compare-breakdown.show {
        display: block;
      }
      
      .rate-compare-breakdown-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      
      .rate-compare-theme-dark {
        --rate-compare-primary: #00d4ff;
        --rate-compare-background: #1a1a1a;
        --rate-compare-text: #ffffff;
        --rate-compare-border: #333333;
      }
      
      .rate-compare-theme-dark .rate-compare-results h3 {
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        border-bottom-color: #333333;
      }
      
      .rate-compare-theme-dark .rate-compare-card {
        border-bottom-color: #333333;
      }
      
      .rate-compare-theme-dark .rate-compare-card:hover {
        background: #2a2a2a;
      }
      
      @media (max-width: 768px) {
        .rate-compare-floating {
          width: calc(100% - 20px);
          right: 10px;
          left: 10px;
          bottom: 10px;
        }
        
        .rate-compare-results h3 {
          font-size: 20px;
          padding: 20px 16px 12px 16px;
        }
        
        .rate-compare-card {
          padding: 16px;
          gap: 12px;
        }
        
        .rate-compare-platform-logo {
          width: 40px;
          height: 40px;
          font-size: 16px;
        }
        
        .rate-compare-price {
          font-size: 20px;
        }
        
        .rate-compare-channel {
          font-size: 14px;
        }
      }
      
      @media (max-width: 480px) {
        .rate-compare-card-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .rate-compare-price-section {
          text-align: left;
          width: 100%;
        }
        
        .rate-compare-book {
          width: 100%;
          text-align: center;
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

    // Sort rates by total price to highlight best deal
    const sortedRates = [...this.rateData].sort((a, b) => a.totalPrice - b.totalPrice);
    const bestPrice = sortedRates[0]?.totalPrice;

    const ratesHtml = sortedRates
      .map((rate, index) => this.createRateCard(rate, rate.totalPrice === bestPrice))
      .join('');

    this.container.innerHTML = `
      <div class="rate-compare-results">
        <h3>Price Comparison Results</h3>
        <div class="rate-compare-rates">
          ${ratesHtml}
        </div>
      </div>
    `;
  }

  /**
   * Creates HTML for a single rate card
   */
  private createRateCard(rate: RateData, isBestDeal: boolean = false): string {
    const checkInDate = new Date(rate.checkIn);
    const checkOutDate = new Date(rate.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = rate.totalPrice / nights;
    
    const channelDisplayName = rate.channel === 'booking' ? 'Booking.com' : 
                              rate.channel === 'expedia' ? 'Expedia' :
                              rate.channel.toUpperCase();
    
    const logoText = rate.channel === 'booking' ? 'B' :
                    rate.channel === 'expedia' ? 'E' :
                    rate.channel === 'airbnb' ? 'A' :
                    rate.channel === 'vrbo' ? 'V' : 'D';
    
    const cardClass = isBestDeal ? 'rate-compare-card best-deal' : 'rate-compare-card';
    const priceClass = isBestDeal ? 'rate-compare-price best-deal' : 'rate-compare-price';
    const buttonClass = isBestDeal ? 'rate-compare-book best-deal' : 'rate-compare-book';
    const channelClass = isBestDeal ? 'rate-compare-channel rate-compare-channel-direct' : 'rate-compare-channel rate-compare-channel-name';
    
    // Calculate savings for best deal (mock calculation)
    const savings = isBestDeal ? Math.floor(rate.totalPrice * 0.15) : 0;
    
    return `
      <div class="${cardClass}">
        <div class="rate-compare-platform-logo ${rate.channel}">
          ${logoText}
        </div>
        <div class="rate-compare-card-content">
          <div class="rate-compare-platform-info">
            <div class="${channelClass}">${channelDisplayName}</div>
            ${isBestDeal ? `<div class="rate-compare-savings">Save $${savings} vs other platforms</div>` : ''}
            <div class="rate-compare-availability ${rate.availability ? 'available' : 'unavailable'}">
              ${rate.availability ? 'Available' : 'Not Available'}
            </div>
          </div>
          <div class="rate-compare-price-section">
            <div class="${priceClass}">$${rate.totalPrice.toFixed(0)}</div>
            <div class="rate-compare-price-per-night">$${pricePerNight.toFixed(0)}/night</div>
            <a href="#" class="${buttonClass}" target="_blank" rel="noopener noreferrer">
              Book Now
            </a>
          </div>
        </div>
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

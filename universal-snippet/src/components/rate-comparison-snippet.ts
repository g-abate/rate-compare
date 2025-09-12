/**
 * Universal Rate Comparison Snippet - Core Implementation
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Supported booking channels
 */
export type SupportedChannel = 'airbnb' | 'vrbo' | 'booking' | 'expedia';

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

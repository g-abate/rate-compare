/**
 * Universal Rate Comparison Snippet - Core Implementation
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

// Types for configuration
export interface RateComparisonConfig {
  propertyId: string;
  channels: string[];
  displayMode?: 'inline' | 'floating';
  theme?: 'light' | 'dark';
  locale?: string;
}

// Supported channels
const SUPPORTED_CHANNELS = ['airbnb', 'vrbo', 'booking', 'expedia'];

// Event types
export type EventType = 'ready' | 'error' | 'rates-loaded' | 'teardown';

// Event handler type
export type EventHandler = (data?: any) => void;

/**
 * Universal Rate Comparison Snippet Class
 * 
 * Provides a universal JavaScript snippet for rate comparison functionality
 * that can be embedded on any website without dependencies.
 */
export class RateComparisonSnippet {
  private config: RateComparisonConfig;
  private container: HTMLElement | null = null;
  private eventHandlers: Map<EventType, EventHandler[]> = new Map();
  private isInitialized = false;

  constructor(config: RateComparisonConfig) {
    // Validate configuration
    this.validateConfig(config);
    
    // Store configuration with defaults
    this.config = {
      displayMode: 'inline',
      theme: 'light',
      locale: 'en-US',
      ...config
    };

    // Initialize event handlers map
    this.initializeEventHandlers();
  }

  /**
   * Validate configuration parameters
   */
  private validateConfig(config: RateComparisonConfig): void {
    if (!config.propertyId || typeof config.propertyId !== 'string' || config.propertyId.trim() === '') {
      throw new Error('Property ID is required');
    }

    if (!config.channels || !Array.isArray(config.channels)) {
      throw new Error('Channels array is required');
    }

    if (config.channels.length === 0) {
      throw new Error('At least one channel is required');
    }

    // Validate each channel
    for (const channel of config.channels) {
      if (!SUPPORTED_CHANNELS.includes(channel)) {
        throw new Error(`Unsupported channel: ${channel}`);
      }
    }
  }

  /**
   * Initialize event handlers map
   */
  private initializeEventHandlers(): void {
    this.eventHandlers.set('ready', []);
    this.eventHandlers.set('error', []);
    this.eventHandlers.set('rates-loaded', []);
    this.eventHandlers.set('teardown', []);
  }

  /**
   * Initialize the snippet
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
   * Create the widget container in DOM
   */
  private createContainer(): void {
    // Remove existing container if it exists
    if (this.container) {
      this.container.remove();
    }

    // Create new container
    this.container = document.createElement('div');
    this.container.setAttribute('data-rate-compare', '');
    this.container.className = 'rate-compare-widget';

    // Add display mode class
    if (this.config.displayMode) {
      this.container.classList.add(`rate-compare-${this.config.displayMode}`);
    }

    // Add theme class
    if (this.config.theme) {
      this.container.classList.add(`rate-compare-theme-${this.config.theme}`);
    }

    // Add to DOM
    document.body.appendChild(this.container);
  }

  /**
   * Apply theme styles using CSS custom properties
   */
  private applyTheme(): void {
    if (!this.container) return;

    const isDark = this.config.theme === 'dark';
    
    // Set CSS custom properties
    this.container.style.setProperty('--rate-compare-primary', isDark ? '#ffffff' : '#000000');
    this.container.style.setProperty('--rate-compare-background', isDark ? '#333333' : '#ffffff');
    this.container.style.setProperty('--rate-compare-text', isDark ? '#ffffff' : '#000000');
    this.container.style.setProperty('--rate-compare-border', isDark ? '#555555' : '#cccccc');
  }

  /**
   * Add event listener
   */
  public on(event: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Remove event listener
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
   * Emit event to all registered handlers
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

  /**
   * Update configuration
   */
  public configure(newConfig: Partial<RateComparisonConfig>): void {
    // Merge new config with existing
    this.config = { ...this.config, ...newConfig };
    
    // Re-apply theme if it changed
    if (newConfig.theme) {
      this.applyTheme();
    }
  }

  /**
   * Clean up and remove the snippet
   */
  public teardown(): void {
    // Remove container from DOM
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    // Clear event handlers
    this.eventHandlers.clear();
    this.initializeEventHandlers();

    // Reset initialization state
    this.isInitialized = false;

    // Emit teardown event
    this.emit('teardown');
  }
}

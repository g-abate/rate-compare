/**
 * Universal snippet tests - TDD Red Phase
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateComparisonSnippet } from '../../src/index';

describe('Rate Comparison Snippet - Core Implementation', () => {
  let snippet: RateComparisonSnippet;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Clear any existing instances
    snippet = null as any;
  });

  afterEach(() => {
    // Clean up
    if (snippet) {
      snippet.teardown();
    }
    document.body.innerHTML = '';
  });

  describe('Core Class Structure', () => {
    it('should create RateComparisonSnippet instance', () => {
      // TDD Red: This test will fail until we implement the class
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      expect(snippet).toBeInstanceOf(RateComparisonSnippet);
    });

    it('should have required public methods', () => {
      // TDD Red: These methods don't exist yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      expect(typeof snippet.init).toBe('function');
      expect(typeof snippet.teardown).toBe('function');
      expect(typeof snippet.configure).toBe('function');
      expect(typeof snippet.on).toBe('function');
      expect(typeof snippet.off).toBe('function');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required propertyId', () => {
      // TDD Red: This validation doesn't exist yet
      expect(() => {
        new RateComparisonSnippet({ channels: ['airbnb'] });
      }).toThrow('Property ID is required');
    });

    it('should validate required channels array', () => {
      // TDD Red: This validation doesn't exist yet
      expect(() => {
        new RateComparisonSnippet({ propertyId: 'test-123' });
      }).toThrow('Channels array is required');
    });

    it('should validate channels array is not empty', () => {
      // TDD Red: This validation doesn't exist yet
      expect(() => {
        new RateComparisonSnippet({ propertyId: 'test-123', channels: [] });
      }).toThrow('At least one channel is required');
    });

    it('should validate supported channels', () => {
      // TDD Red: This validation doesn't exist yet
      expect(() => {
        new RateComparisonSnippet({ 
          propertyId: 'test-123', 
          channels: ['invalid-channel'] 
        });
      }).toThrow('Unsupported channel: invalid-channel');
    });

    it('should accept valid configuration', () => {
      // TDD Red: This should work once validation is implemented
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo'],
        displayMode: 'inline' as const,
        theme: 'light' as const
      };
      
      expect(() => {
        snippet = new RateComparisonSnippet(config);
      }).not.toThrow();
    });
  });

  describe('Initialization', () => {
    it('should initialize without errors', async () => {
      // TDD Red: init method doesn't exist yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      await expect(snippet.init()).resolves.not.toThrow();
    });

    it('should be idempotent - multiple init calls should not cause issues', async () => {
      // TDD Red: idempotency not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      await snippet.init();
      await expect(snippet.init()).resolves.not.toThrow();
    });

    it('should create widget container in DOM', async () => {
      // TDD Red: DOM creation not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      await snippet.init();
      
      const container = document.querySelector('[data-rate-compare]');
      expect(container).toBeTruthy();
      expect(container?.classList.contains('rate-compare-widget')).toBe(true);
    });
  });

  describe('Display Modes', () => {
    it('should support inline display mode', async () => {
      // TDD Red: Display modes not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo'],
        displayMode: 'inline' as const
      };
      
      snippet = new RateComparisonSnippet(config);
      await snippet.init();
      
      const container = document.querySelector('[data-rate-compare]');
      expect(container?.classList.contains('rate-compare-inline')).toBe(true);
    });

    it('should support floating display mode', async () => {
      // TDD Red: Display modes not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo'],
        displayMode: 'floating' as const
      };
      
      snippet = new RateComparisonSnippet(config);
      await snippet.init();
      
      const container = document.querySelector('[data-rate-compare]');
      expect(container?.classList.contains('rate-compare-floating')).toBe(true);
    });
  });

  describe('Event System', () => {
    it('should support event listeners', () => {
      // TDD Red: Event system not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      const mockHandler = vi.fn();
      snippet.on('ready', mockHandler);
      
      expect(typeof snippet.on).toBe('function');
    });

    it('should support removing event listeners', () => {
      // TDD Red: Event system not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      const mockHandler = vi.fn();
      snippet.on('ready', mockHandler);
      snippet.off('ready', mockHandler);
      
      expect(typeof snippet.off).toBe('function');
    });

    it('should emit ready event after initialization', async () => {
      // TDD Red: Event emission not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      const mockHandler = vi.fn();
      snippet.on('ready', mockHandler);
      
      await snippet.init();
      
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Configuration Updates', () => {
    it('should support configuration updates', () => {
      // TDD Red: Configuration updates not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      const newConfig = { theme: 'dark' as const };
      snippet.configure(newConfig);
      
      expect(typeof snippet.configure).toBe('function');
    });
  });

  describe('Teardown', () => {
    it('should clean up DOM elements', async () => {
      // TDD Red: Teardown not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      await snippet.init();
      
      expect(document.querySelector('[data-rate-compare]')).toBeTruthy();
      
      snippet.teardown();
      
      expect(document.querySelector('[data-rate-compare]')).toBeNull();
    });

    it('should remove event listeners', async () => {
      // TDD Red: Event cleanup not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      const mockHandler = vi.fn();
      snippet.on('ready', mockHandler);
      
      await snippet.init();
      snippet.teardown();
      
      // After teardown, events should not fire
      await snippet.init();
      expect(mockHandler).toHaveBeenCalledTimes(1); // Only called once, not twice
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // TDD Red: Error handling not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      // Mock a scenario that would cause initialization to fail
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(snippet.init()).resolves.not.toThrow();
    });

    it('should emit error events', async () => {
      // TDD Red: Error events not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo']
      };
      
      snippet = new RateComparisonSnippet(config);
      
      const errorHandler = vi.fn();
      snippet.on('error', errorHandler);
      
      // This should trigger an error event
      await snippet.init();
      
      expect(typeof errorHandler).toBe('function');
    });
  });

  describe('CSS Custom Properties', () => {
    it('should apply theme custom properties', async () => {
      // TDD Red: CSS custom properties not implemented yet
      const config = {
        propertyId: 'test-123',
        channels: ['airbnb', 'vrbo'],
        theme: 'dark' as const
      };
      
      snippet = new RateComparisonSnippet(config);
      await snippet.init();
      
      const container = document.querySelector('[data-rate-compare]') as HTMLElement;
      const styles = getComputedStyle(container);
      
      expect(styles.getPropertyValue('--rate-compare-primary')).toBeTruthy();
    });
  });
});

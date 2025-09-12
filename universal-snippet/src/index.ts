/**
 * Universal Rate Comparison Snippet
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

// Export the main class
export { RateComparisonSnippet } from './components/rate-comparison-snippet';

// Export types
export type { 
  RateComparisonConfig, 
  EventType, 
  EventHandler,
  SupportedChannel,
  DisplayMode,
  Theme
} from './components/rate-comparison-snippet';

// Legacy function for backward compatibility
export function initRateComparison(): void {
  // eslint-disable-next-line no-console
  console.log('Rate comparison initialized');
}

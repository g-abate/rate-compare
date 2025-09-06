/**
 * Shared library entry point
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

// Data models
export * from './data-models/rate-data';

// Utilities
export * from './utils/date-utils';

// Re-export types for convenience
export type {
  RateData,
  PropertyConfig,
  RateComparisonResult
} from './data-models/rate-data';

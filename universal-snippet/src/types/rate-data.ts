/**
 * Rate Data Types for Universal Snippet
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

/**
 * Supported booking channels
 */
export type SupportedChannel = 'airbnb' | 'vrbo' | 'booking' | 'expedia';

/**
 * Rate data structure for a single booking channel
 */
export interface RateData {
  /** Booking channel name */
  channel: SupportedChannel;
  /** Property identifier */
  propertyId: string;
  /** Check-in date (ISO string) */
  checkIn: string;
  /** Check-out date (ISO string) */
  checkOut: string;
  /** Base price before fees */
  basePrice: number;
  /** Fee breakdown */
  fees: {
    /** Cleaning fee */
    cleaning: number;
    /** Service fee */
    service: number;
    /** Taxes */
    taxes: number;
    /** Other fees */
    other: number;
  };
  /** Total price including all fees */
  totalPrice: number;
  /** Currency code */
  currency: string;
  /** Availability status */
  availability: boolean;
  /** Last updated timestamp */
  lastUpdated: string;
}

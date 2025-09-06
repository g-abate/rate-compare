/**
 * Rate data models and validation
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

export interface RateData {
  channel: 'airbnb' | 'vrbo' | 'booking' | 'expedia';
  propertyId: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  basePrice: number;
  fees: {
    cleaning: number;
    service: number;
    taxes: number;
    other: number;
  };
  totalPrice: number;
  currency: string;
  availability: boolean;
  lastUpdated: string; // ISO timestamp
}

export interface PropertyConfig {
  id: string;
  name: string;
  channels: {
    airbnb?: string; // URL or property ID
    vrbo?: string;
    booking?: string;
    expedia?: string;
  };
  settings: {
    displayMode: 'inline' | 'floating';
    theme: 'light' | 'dark';
    locale: string;
  };
}

export interface RateComparisonResult {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  rates: RateData[];
  bestRate: RateData | null;
  savings: {
    amount: number;
    percentage: number;
  } | null;
  lastUpdated: string;
}

/**
 * Validate rate data
 */
export function validateRateData(data: any): data is RateData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = [
    'channel', 'propertyId', 'checkIn', 'checkOut', 
    'basePrice', 'fees', 'totalPrice', 'currency', 
    'availability', 'lastUpdated'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return false;
    }
  }

  // Validate channel
  if (!['airbnb', 'vrbo', 'booking', 'expedia'].includes(data.channel)) {
    return false;
  }

  // Validate property ID
  if (typeof data.propertyId !== 'string' || data.propertyId.trim() === '') {
    return false;
  }

  // Validate dates
  if (!isValidISODate(data.checkIn) || !isValidISODate(data.checkOut)) {
    return false;
  }

  // Validate prices
  if (typeof data.basePrice !== 'number' || data.basePrice < 0) {
    return false;
  }

  if (typeof data.totalPrice !== 'number' || data.totalPrice < 0) {
    return false;
  }

  // Validate fees
  if (!data.fees || typeof data.fees !== 'object') {
    return false;
  }

  const feeFields = ['cleaning', 'service', 'taxes', 'other'];
  for (const field of feeFields) {
    if (typeof data.fees[field] !== 'number' || data.fees[field] < 0) {
      return false;
    }
  }

  // Validate currency
  if (typeof data.currency !== 'string' || data.currency.length !== 3) {
    return false;
  }

  // Validate availability
  if (typeof data.availability !== 'boolean') {
    return false;
  }

  // Validate last updated
  if (!isValidISODate(data.lastUpdated)) {
    return false;
  }

  return true;
}

/**
 * Validate property configuration
 */
export function validatePropertyConfig(config: any): config is PropertyConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'name', 'channels', 'settings'];
  for (const field of requiredFields) {
    if (!(field in config)) {
      return false;
    }
  }

  // Validate ID
  if (typeof config.id !== 'string' || config.id.trim() === '') {
    return false;
  }

  // Validate name
  if (typeof config.name !== 'string' || config.name.trim() === '') {
    return false;
  }

  // Validate channels
  if (!config.channels || typeof config.channels !== 'object') {
    return false;
  }

  const validChannels = ['airbnb', 'vrbo', 'booking', 'expedia'];
  for (const [key, value] of Object.entries(config.channels)) {
    if (!validChannels.includes(key)) {
      return false;
    }
    if (value !== null && (typeof value !== 'string' || value.trim() === '')) {
      return false;
    }
  }

  // Validate settings
  if (!config.settings || typeof config.settings !== 'object') {
    return false;
  }

  if (!['inline', 'floating'].includes(config.settings.displayMode)) {
    return false;
  }

  if (!['light', 'dark'].includes(config.settings.theme)) {
    return false;
  }

  if (typeof config.settings.locale !== 'string' || config.settings.locale.trim() === '') {
    return false;
  }

  return true;
}

/**
 * Check if a string is a valid ISO date
 */
function isValidISODate(dateString: string): boolean {
  if (typeof dateString !== 'string') {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Create a new rate data object with defaults
 */
export function createRateData(overrides: Partial<RateData> = {}): RateData {
  const now = new Date().toISOString();
  
  return {
    channel: 'airbnb',
    propertyId: '',
    checkIn: '',
    checkOut: '',
    basePrice: 0,
    fees: {
      cleaning: 0,
      service: 0,
      taxes: 0,
      other: 0
    },
    totalPrice: 0,
    currency: 'USD',
    availability: true,
    lastUpdated: now,
    ...overrides
  };
}

/**
 * Create a new property configuration with defaults
 */
export function createPropertyConfig(overrides: Partial<PropertyConfig> = {}): PropertyConfig {
  return {
    id: '',
    name: '',
    channels: {},
    settings: {
      displayMode: 'inline',
      theme: 'light',
      locale: 'en-US'
    },
    ...overrides
  };
}

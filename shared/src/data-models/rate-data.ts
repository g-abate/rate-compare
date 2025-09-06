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
export function validateRateData(data: unknown): data is RateData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const dataObj = data as Record<string, unknown>;

  const requiredFields = [
    'channel',
    'propertyId',
    'checkIn',
    'checkOut',
    'basePrice',
    'fees',
    'totalPrice',
    'currency',
    'availability',
    'lastUpdated',
  ];

  for (const field of requiredFields) {
    if (!(field in dataObj)) {
      return false;
    }
  }

  // Validate channel
  if (!['airbnb', 'vrbo', 'booking', 'expedia'].includes(dataObj.channel as string)) {
    return false;
  }

  // Validate property ID
  if (typeof dataObj.propertyId !== 'string' || dataObj.propertyId.trim() === '') {
    return false;
  }

  // Validate dates
  if (!isValidISODate(dataObj.checkIn as string) || !isValidISODate(dataObj.checkOut as string)) {
    return false;
  }

  // Validate prices
  if (typeof dataObj.basePrice !== 'number' || dataObj.basePrice < 0) {
    return false;
  }

  if (typeof dataObj.totalPrice !== 'number' || dataObj.totalPrice < 0) {
    return false;
  }

  // Validate fees
  if (!dataObj.fees || typeof dataObj.fees !== 'object') {
    return false;
  }

  const feesObj = dataObj.fees as Record<string, unknown>;
  const feeFields = ['cleaning', 'service', 'taxes', 'other'];
  for (const field of feeFields) {
    if (typeof feesObj[field] !== 'number' || feesObj[field] < 0) {
      return false;
    }
  }

  // Validate currency
  if (typeof dataObj.currency !== 'string' || dataObj.currency.length !== 3) {
    return false;
  }

  // Validate availability
  if (typeof dataObj.availability !== 'boolean') {
    return false;
  }

  // Validate last updated
  if (!isValidISODate(dataObj.lastUpdated as string)) {
    return false;
  }

  return true;
}

/**
 * Validate property configuration
 */
export function validatePropertyConfig(config: unknown): config is PropertyConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const configObj = config as Record<string, unknown>;

  const requiredFields = ['id', 'name', 'channels', 'settings'];
  for (const field of requiredFields) {
    if (!(field in configObj)) {
      return false;
    }
  }

  // Validate ID
  if (typeof configObj.id !== 'string' || configObj.id.trim() === '') {
    return false;
  }

  // Validate name
  if (typeof configObj.name !== 'string' || configObj.name.trim() === '') {
    return false;
  }

  // Validate channels
  if (!configObj.channels || typeof configObj.channels !== 'object') {
    return false;
  }

  const channelsObj = configObj.channels as Record<string, unknown>;
  const validChannels = ['airbnb', 'vrbo', 'booking', 'expedia'];
  for (const [key, value] of Object.entries(channelsObj)) {
    if (!validChannels.includes(key)) {
      return false;
    }
    if (value !== null && (typeof value !== 'string' || value.trim() === '')) {
      return false;
    }
  }

  // Validate settings
  if (!configObj.settings || typeof configObj.settings !== 'object') {
    return false;
  }

  const settingsObj = configObj.settings as Record<string, unknown>;
  if (!['inline', 'floating'].includes(settingsObj.displayMode as string)) {
    return false;
  }

  if (!['light', 'dark'].includes(settingsObj.theme as string)) {
    return false;
  }

  if (typeof settingsObj.locale !== 'string' || settingsObj.locale.trim() === '') {
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
      other: 0,
    },
    totalPrice: 0,
    currency: 'USD',
    availability: true,
    lastUpdated: now,
    ...overrides,
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
      locale: 'en-US',
    },
    ...overrides,
  };
}

/**
 * Jest setup file for browser automation tests
 */

// Increase timeout for browser automation tests
jest.setTimeout(300000);

// Global test utilities
global.testUtils = {
  // Wait for a condition to be true
  waitFor: async (condition, timeout = 10000, interval = 100) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  // Create a mock Airbnb response
  createMockAirbnbResponse: (overrides = {}) => ({
    propertyId: '12345678',
    propertyUrl: 'https://www.airbnb.com/rooms/12345678',
    checkIn: '2025-09-15',
    checkOut: '2025-09-22',
    rates: [{
      channel: 'airbnb',
      basePrice: 100,
      cleaningFee: 15,
      serviceFee: 12,
      taxes: 8,
      totalPrice: 135,
      currency: 'USD',
      availability: true,
      lastUpdated: new Date().toISOString(),
      note: 'Mock data for testing'
    }],
    scrapedAt: new Date().toISOString(),
    source: 'mock',
    ...overrides
  }),

  // Generate random property ID
  generatePropertyId: () => Math.floor(Math.random() * 1000000000).toString(),

  // Generate random dates
  generateDates: (daysFromNow = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return {
      checkIn: startDate.toISOString().split('T')[0],
      checkOut: endDate.toISOString().split('T')[0]
    };
  }
};

// Console logging for tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Suppress console output in tests unless DEBUG is set
if (!process.env.DEBUG) {
  console.log = () => {};
  console.error = () => {};
}

// Restore console for specific test suites
global.enableConsoleLogging = () => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
};

global.disableConsoleLogging = () => {
  console.log = () => {};
  console.error = () => {};
};
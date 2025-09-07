# 🧪 Rate Comparison Scraper Test Suite

This directory contains a comprehensive test suite for testing our rate comparison scraper with real-world scenarios.

## 🚀 Quick Start

### 1. Start the Test Server
```bash
node test-scraper-server.js
```

### 2. Open the Test Interface
Open your browser and go to: **http://localhost:3000**

### 3. Test the Scraper
- Enter an Airbnb property URL
- Select check-in and check-out dates
- Click "Test Scraper" to see results

## 📁 Test Files

### `test-scraper-server.js`
- **Purpose**: HTTP server that provides a web interface and API for testing
- **Features**:
  - Web interface with date pickers and URL input
  - REST API endpoint (`/api/scrape`) for programmatic testing
  - Health check endpoint (`/health`)
  - Mock scraper that simulates real Airbnb scraping

### `test-scraper-site.html`
- **Purpose**: Beautiful web interface for manual testing
- **Features**:
  - Date picker inputs for check-in/check-out
  - Property URL input field
  - Real-time results display
  - Error handling and loading states

### `test-scraper-integration.js`
- **Purpose**: Automated integration tests
- **Features**:
  - Tests valid and invalid URLs
  - Tests date validation
  - Tests error handling
  - Provides detailed test results

## 🧪 Test Scenarios

### ✅ Valid Tests
1. **Valid Airbnb URL**: `https://www.airbnb.com/rooms/12345678`
2. **Date Range**: Tomorrow to day after tomorrow
3. **Expected Result**: Mock rate data with realistic pricing

### ❌ Error Tests
1. **Invalid URL**: `https://example.com/invalid`
2. **Invalid Date Range**: Check-out before check-in
3. **Expected Result**: Appropriate error messages

## 📊 Test Results

```
🚀 Starting Scraper Integration Tests

🏥 Testing health endpoint...
✅ Health check passed: healthy

🧪 Testing: Valid Airbnb URL
   URL: https://www.airbnb.com/rooms/12345678
   Dates: 2024-02-01 to 2024-02-03
✅ Test passed
   Property ID: 12345678
   Total Price: $214
   Currency: USD

📊 Integration Test Results:
   Passed: 4/4
   Success Rate: 100%

🎉 All integration tests passed!
```

## 🔧 API Endpoints

### `POST /api/scrape`
Scrapes rates for a given property and date range.

**Request Body:**
```json
{
  "propertyUrl": "https://www.airbnb.com/rooms/12345678",
  "startDate": "2024-02-01",
  "endDate": "2024-02-03"
}
```

**Response:**
```json
{
  "propertyId": "12345678",
  "propertyUrl": "https://www.airbnb.com/rooms/12345678",
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-03",
  "rates": [
    {
      "channel": "airbnb",
      "basePrice": 150,
      "cleaningFee": 25,
      "serviceFee": 18.5,
      "taxes": 12.3,
      "totalPrice": 205.8,
      "currency": "USD",
      "availability": true,
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    }
  ],
  "scrapedAt": "2024-01-15T10:30:00.000Z"
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "scraper": "MockAirbnbScraper v1.0.0"
}
```

## 🎯 Next Steps

1. **Replace Mock Scraper**: Integrate with our actual `WebScraper` and `AirbnbScraper` classes
2. **Add Real URLs**: Test with actual Airbnb property URLs
3. **Add More Channels**: Test VRBO, Booking.com, Expedia scrapers
4. **Performance Testing**: Add load testing and performance benchmarks
5. **Error Scenarios**: Test network failures, rate limiting, etc.

## 🛠️ Development

### Running Tests
```bash
# Start server
node test-scraper-server.js

# Run integration tests (in another terminal)
node test-scraper-integration.js

# Open web interface
open http://localhost:3000
```

### Customizing Tests
- Modify `TEST_CONFIG.testCases` in `test-scraper-integration.js` to add new test scenarios
- Update the mock scraper in `test-scraper-server.js` to simulate different behaviors
- Customize the web interface in `test-scraper-site.html`

## 📝 Notes

- The current implementation uses a **mock scraper** for testing purposes
- Real scraping would require integration with our actual `WebScraper` class
- The mock generates realistic pricing based on property ID for testing
- All tests are designed to work offline and don't make real HTTP requests to Airbnb

## 🎉 Success Criteria

✅ **All integration tests pass (4/4)**  
✅ **Web interface loads and functions correctly**  
✅ **API endpoints respond with proper data**  
✅ **Error handling works for invalid inputs**  
✅ **Date validation prevents invalid ranges**  

The scraper infrastructure is ready for real-world testing! 🚀

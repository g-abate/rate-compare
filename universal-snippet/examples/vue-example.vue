<template>
  <div class="rate-compare-demo">
    <h2>Rate Comparison Demo</h2>
    
    <div class="date-selector">
      <label>
        Check-in Date:
        <input
          type="date"
          v-model="checkIn"
        />
      </label>
      
      <label>
        Check-out Date:
        <input
          type="date"
          v-model="checkOut"
        />
      </label>
    </div>

    <div class="widget-container">
      <!-- The widget will be injected here -->
    </div>

    <div v-if="error" class="error-message">
      Error: {{ error.message }}
    </div>

    <div v-if="isLoading" class="loading-message">
      Loading rates...
    </div>

    <div v-if="rates.length > 0" class="rates-summary">
      <h3>Rate Summary</h3>
      <p>Found {{ rates.length }} rates</p>
      <ul>
        <li v-for="(rate, index) in rates" :key="index">
          {{ rate.channel }}: ${{ rate.totalPrice.toFixed(2) }} 
          {{ rate.availability ? '(Available)' : '(Not Available)' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// Load the Rate Compare snippet (in a real app, this would be from a CDN)
import { RateComparisonSnippet } from '../dist/rate-compare.esm.js';

export default {
  name: 'RateCompareDemo',
  data() {
    return {
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      rates: [],
      isLoading: false,
      error: null,
      snippet: null,
    };
  },
  mounted() {
    this.initializeWidget();
  },
  beforeUnmount() {
    if (this.snippet) {
      this.snippet.teardown();
    }
  },
  watch: {
    checkIn() {
      this.fetchRates();
    },
    checkOut() {
      this.fetchRates();
    },
  },
  methods: {
    async initializeWidget() {
      try {
        this.snippet = new RateComparisonSnippet({
          propertyId: 'demo-property-123',
          channels: ['airbnb', 'vrbo', 'booking'],
          displayMode: 'inline',
          theme: 'light',
        });

        // Set up event listeners
        this.snippet.on('ready', () => {
          console.log('Rate Compare widget ready');
        });

        this.snippet.on('rates-loaded', (rates) => {
          console.log('Rates loaded:', rates);
          this.rates = rates;
          this.isLoading = false;
          this.error = null;
        });

        this.snippet.on('error', (error) => {
          console.error('Rate Compare error:', error);
          this.error = error;
          this.isLoading = false;
        });

        // Initialize the widget
        await this.snippet.init();
        
        // Initial fetch with default dates
        await this.fetchRates();
      } catch (error) {
        console.error('Failed to initialize widget:', error);
        this.error = error;
      }
    },

    async fetchRates() {
      if (!this.snippet || !this.checkIn || !this.checkOut) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        await this.snippet.fetchRates(this.checkIn, this.checkOut);
      } catch (error) {
        console.error('Failed to fetch rates:', error);
        this.error = error;
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.rate-compare-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.date-selector {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  align-items: center;
}

.date-selector label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-selector input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.widget-container {
  margin: 20px 0;
  min-height: 200px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.loading-message {
  background: #d1ecf1;
  color: #0c5460;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.rates-summary {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.rates-summary ul {
  list-style: none;
  padding: 0;
}

.rates-summary li {
  padding: 5px 0;
  border-bottom: 1px solid #c3e6cb;
}

.rates-summary li:last-child {
  border-bottom: none;
}
</style>

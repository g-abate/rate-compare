/**
 * React Integration Example for Rate Compare Universal Snippet
 *
 * This example shows how to integrate the Rate Compare snippet into a React application.
 */

import React, { useEffect, useRef, useState } from 'react';

// Load the Rate Compare snippet (in a real app, this would be from a CDN)
import { RateComparisonSnippet } from '../dist/rate-compare.esm.js';

const RateCompareWidget = ({ 
  propertyId, 
  channels = ['airbnb', 'vrbo'], 
  displayMode = 'inline',
  theme = 'light',
  checkIn,
  checkOut,
  onRatesLoaded,
  onError 
}) => {
  const snippetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize the snippet
    const snippet = new RateComparisonSnippet({
      propertyId,
      channels,
      displayMode,
      theme,
    });

    snippetRef.current = snippet;

    // Set up event listeners
    snippet.on('ready', () => {
      console.log('Rate Compare widget ready');
    });

    snippet.on('rates-loaded', (rates) => {
      console.log('Rates loaded:', rates);
      setIsLoading(false);
      setError(null);
      if (onRatesLoaded) {
        onRatesLoaded(rates);
      }
    });

    snippet.on('error', (err) => {
      console.error('Rate Compare error:', err);
      setIsLoading(false);
      setError(err);
      if (onError) {
        onError(err);
      }
    });

    // Initialize the widget
    snippet.init().catch((err) => {
      console.error('Failed to initialize widget:', err);
      setError(err);
    });

    // Cleanup on unmount
    return () => {
      if (snippetRef.current) {
        snippetRef.current.teardown();
      }
    };
  }, [propertyId, channels, displayMode, theme, onRatesLoaded, onError]);

  // Fetch rates when dates change
  useEffect(() => {
    if (snippetRef.current && checkIn && checkOut) {
      setIsLoading(true);
      setError(null);
      
      snippetRef.current.fetchRates(checkIn, checkOut).catch((err) => {
        console.error('Failed to fetch rates:', err);
        setError(err);
        setIsLoading(false);
      });
    }
  }, [checkIn, checkOut]);

  return (
    <div className="rate-compare-react-wrapper">
      {error && (
        <div className="error-message">
          Error: {error.message}
        </div>
      )}
      {isLoading && (
        <div className="loading-message">
          Loading rates...
        </div>
      )}
      {/* The widget will be injected into the DOM by the snippet */}
    </div>
  );
};

// Example usage component
const RateCompareDemo = () => {
  const [checkIn, setCheckIn] = useState('2024-01-15');
  const [checkOut, setCheckOut] = useState('2024-01-17');
  const [rates, setRates] = useState([]);

  const handleRatesLoaded = (loadedRates) => {
    setRates(loadedRates);
  };

  const handleError = (error) => {
    console.error('Rate fetching error:', error);
    // Handle error (show toast, etc.)
  };

  return (
    <div className="rate-compare-demo">
      <h2>Rate Comparison Demo</h2>
      
      <div className="date-selector">
        <label>
          Check-in Date:
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>
        
        <label>
          Check-out Date:
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
      </div>

      <div className="widget-container">
        <RateCompareWidget
          propertyId="demo-property-123"
          channels={['airbnb', 'vrbo', 'booking']}
          displayMode="inline"
          theme="light"
          checkIn={checkIn}
          checkOut={checkOut}
          onRatesLoaded={handleRatesLoaded}
          onError={handleError}
        />
      </div>

      {rates.length > 0 && (
        <div className="rates-summary">
          <h3>Rate Summary</h3>
          <p>Found {rates.length} rates</p>
          <ul>
            {rates.map((rate, index) => (
              <li key={index}>
                {rate.channel}: ${rate.totalPrice.toFixed(2)} 
                {rate.availability ? ' (Available)' : ' (Not Available)'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RateCompareDemo;

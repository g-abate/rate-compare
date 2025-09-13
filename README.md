# Rate Compare - Universal Rate Comparison System

A comprehensive rate comparison system for short-term rental properties, available as both a WordPress plugin and a universal JavaScript snippet.

## 🏗️ Monorepo Structure

This repository contains three main packages:

- **`wordpress-plugin/`** - WordPress plugin for rate comparison
- **`universal-snippet/`** - Universal JavaScript snippet for any website (✅ **COMPLETE**)
- **`shared/`** - Shared core logic and utilities (✅ **COMPLETE**)

## ✨ Universal JavaScript Snippet

The universal snippet is a **production-ready** JavaScript library that can be embedded on any website to provide real-time rate comparison across multiple booking channels.

### 🎯 Key Features

- **Universal Compatibility**: Works on any website platform (WordPress, Shopify, React, Vue, etc.)
- **Professional UI**: Modern card-based design with platform logos and best deal highlighting
- **Multi-Channel Support**: Airbnb, VRBO, Booking.com, Expedia rate comparison
- **Mobile-First**: Responsive design optimized for all devices
- **Easy Integration**: Single script tag installation with configuration panel
- **Performance Optimized**: Lightweight, cached, and tree-shakeable

### 📦 Installation

#### CDN (Recommended)
```html
<script src="https://cdn.example.com/rate-compare.umd.min.js"></script>
```

#### NPM
```bash
npm install @rate-compare/universal-snippet
```

### 🚀 Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Property Listing</title>
</head>
<body>
    <!-- Your content -->
    
    <!-- Rate Compare Widget -->
    <script src="https://cdn.example.com/rate-compare.umd.min.js"></script>
    <script>
        const rateCompare = new RateCompare.RateComparisonSnippet({
            propertyId: 'your-property-123',
            channels: ['airbnb', 'vrbo', 'booking'],
            displayMode: 'inline',
            theme: 'light'
        });

        rateCompare.init().then(() => {
            console.log('Rate comparison widget ready');
        });
    </script>
</body>
</html>
```

### 🎨 Display Modes

#### Inline Mode
```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    propertyId: 'property-123',
    channels: ['airbnb', 'vrbo'],
    displayMode: 'inline',  // Embedded in page content
    theme: 'light'
});
```

#### Floating Mode
```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    propertyId: 'property-123',
    channels: ['airbnb', 'vrbo'],
    displayMode: 'floating',  // Fixed position widget
    theme: 'dark'
});
```

### 🔧 Configuration Options

```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    // Required
    propertyId: 'your-property-id',
    channels: ['airbnb', 'vrbo', 'booking', 'expedia'],
    
    // Optional
    displayMode: 'inline',     // 'inline' | 'floating'
    theme: 'light',           // 'light' | 'dark'
    locale: 'en-US'           // 'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE'
});
```

### 📱 React Integration

```jsx
import React, { useEffect, useRef } from 'react';
import { RateComparisonSnippet } from '@rate-compare/universal-snippet';

const RateCompareWidget = ({ propertyId, channels }) => {
    const snippetRef = useRef(null);

    useEffect(() => {
        const snippet = new RateComparisonSnippet({
            propertyId,
            channels,
            displayMode: 'inline',
            theme: 'light'
        });

        snippetRef.current = snippet;
        snippet.init();

        return () => snippet.teardown();
    }, [propertyId, channels]);

    return <div id="rate-compare-widget" />;
};
```

### 🎯 Vue.js Integration

```vue
<template>
    <div id="rate-compare-widget"></div>
</template>

<script>
import { RateComparisonSnippet } from '@rate-compare/universal-snippet';

export default {
    props: ['propertyId', 'channels'],
    data() {
        return {
            snippet: null
        };
    },
    mounted() {
        this.snippet = new RateComparisonSnippet({
            propertyId: this.propertyId,
            channels: this.channels,
            displayMode: 'inline',
            theme: 'light'
        });
        
        this.snippet.init();
    },
    beforeUnmount() {
        if (this.snippet) {
            this.snippet.teardown();
        }
    }
};
</script>
```

### 🎨 Styling & Customization

The widget uses CSS custom properties for easy theming:

```css
.rate-compare-widget {
    --rate-compare-primary: #007cba;
    --rate-compare-background: #ffffff;
    --rate-compare-text: #333333;
    --rate-compare-border: #e0e0e0;
}
```

### 📊 API Reference

#### Methods

- `init()` - Initialize the widget
- `fetchRates(checkIn, checkOut)` - Fetch rates for specific dates
- `configure(newConfig)` - Update configuration
- `on(event, handler)` - Add event listener
- `off(event, handler)` - Remove event listener
- `teardown()` - Clean up and remove widget

#### Events

- `ready` - Widget initialized and ready
- `rates-loaded` - Rates fetched and displayed
- `error` - Error occurred
- `teardown` - Widget cleaned up

#### Example Usage

```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    propertyId: 'demo-123',
    channels: ['airbnb', 'vrbo']
});

// Event handling
snippet.on('ready', () => {
    console.log('Widget ready');
});

snippet.on('rates-loaded', (rates) => {
    console.log('Rates loaded:', rates);
});

snippet.on('error', (error) => {
    console.error('Error:', error);
});

// Initialize and fetch rates
await snippet.init();
await snippet.fetchRates('2024-01-15', '2024-01-17');
```

### 🧪 Testing

```bash
# Run tests
cd universal-snippet
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### 📦 Build Outputs

- `rate-compare.umd.js` - Universal Module Definition
- `rate-compare.esm.js` - ES Modules
- `rate-compare.umd.min.js` - Minified UMD
- TypeScript declarations included

### 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 📖 Examples

Check out the `universal-snippet/examples/` directory for:
- Basic HTML integration
- React component example
- Vue.js component example
- Configuration panel for non-technical users

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PHP 7.4+ (for WordPress plugin)
- Composer (for WordPress plugin)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install individually
npm install                    # Root dependencies
cd shared && npm install       # Shared library
cd ../universal-snippet && npm install  # Universal snippet
cd ../wordpress-plugin && composer install  # WordPress plugin
```

### Development

```bash
# Run all tests
npm test

# Run tests for specific package
npm run test:shared
npm run test:universal-snippet
npm run test:wordpress

# Build all packages
npm run build

# Build specific package
npm run build:shared
npm run build:universal-snippet

# Development mode
npm run dev
```

## 📦 Packages

### WordPress Plugin (`wordpress-plugin/`)

A full-featured WordPress plugin that provides:
- Admin interface for configuration
- Frontend rate comparison display
- Integration with WordPress hooks and filters
- Database management for configurations

**Installation:**
1. Upload the `wordpress-plugin/` folder to `/wp-content/plugins/`
2. Activate the plugin in WordPress admin
3. Configure your property listings

### Universal Snippet (`universal-snippet/`)

A lightweight JavaScript snippet that works on any website:
- Zero dependencies
- CDN distribution
- Configuration panel for non-technical users
- Mobile-first responsive design

**Installation:**
```html
<script>
(function(){
  if (window.__rateCompareLoaded) return; 
  window.__rateCompareLoaded = true;
  var s = document.createElement('script');
  s.async = true; s.defer = true; 
  s.src = 'https://cdn.example.com/rate-compare.umd.js';
  (document.head || document.documentElement).appendChild(s);
})();
</script>
```

### Shared Library (`shared/`)

Core logic shared between WordPress plugin and universal snippet:
- Rate fetching from multiple channels (Airbnb, VRBO, Booking.com, Expedia)
- Data validation and normalization
- Caching strategies
- Error handling

## 🛠️ Development

### Code Quality

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage reports
npm run test:coverage
```

### Building

```bash
# Build all packages
npm run build

# Clean build artifacts
npm run clean
```

## 📋 Supported Channels

- **Airbnb** - Web scraping and API integration
- **VRBO** - Web scraping and API integration  
- **Booking.com** - Web scraping and API integration
- **Expedia** - Web scraping and API integration

## 🔧 Configuration

Both the WordPress plugin and universal snippet support:
- Multiple property configurations
- Custom theming and branding
- Date range selection
- Real-time rate fetching
- Caching for performance

## 📚 Documentation

- [WordPress Plugin Documentation](wordpress-plugin/README.md)
- [Universal Snippet Documentation](universal-snippet/README.md)
- [Shared Library Documentation](shared/README.md)
- [API Reference](docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

GPL-2.0-or-later

## 🆘 Support

- [GitHub Issues](https://github.com/g-abate/rate-compare/issues)
- [Documentation](https://github.com/g-abate/rate-compare#readme)

## 🏷️ Version

Current version: 1.0.0

---

**Note**: This is a monorepo. Each package has its own `package.json` and can be developed independently while sharing common code through the `shared/` directory.
# Rate Compare Universal Snippet

A production-ready JavaScript library for embedding rate comparison widgets on any website. Compare rates across Airbnb, VRBO, Booking.com, and Expedia with a beautiful, responsive interface.

## 🎯 Features

- **Universal Compatibility**: Works on any website platform
- **Professional UI**: Modern card-based design with platform logos
- **Multi-Channel Support**: Compare rates across 4+ booking platforms
- **Mobile-First**: Responsive design optimized for all devices
- **Easy Integration**: Single script tag installation
- **Performance Optimized**: Lightweight, cached, tree-shakeable
- **TypeScript Support**: Full type definitions included

## 📦 Installation

### CDN (Recommended)
```html
<script src="https://cdn.example.com/rate-compare.umd.min.js"></script>
```

### NPM
```bash
npm install @rate-compare/universal-snippet
```

### Local Build
```bash
npm install
npm run build
```

## 🚀 Quick Start

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Property</title>
</head>
<body>
    <h1>Beautiful Vacation Rental</h1>
    
    <!-- Date Selection -->
    <div>
        <label>Check-in: <input type="date" id="checkin"></label>
        <label>Check-out: <input type="date" id="checkout"></label>
        <button onclick="compareRates()">Compare Rates</button>
    </div>
    
    <!-- Rate Compare Widget -->
    <script src="https://cdn.example.com/rate-compare.umd.min.js"></script>
    <script>
        const snippet = new RateCompare.RateComparisonSnippet({
            propertyId: 'your-property-123',
            channels: ['airbnb', 'vrbo', 'booking'],
            displayMode: 'inline',
            theme: 'light'
        });

        // Initialize widget
        snippet.init();

        // Fetch rates function
        async function compareRates() {
            const checkIn = document.getElementById('checkin').value;
            const checkOut = document.getElementById('checkout').value;
            
            if (checkIn && checkOut) {
                await snippet.fetchRates(checkIn, checkOut);
            }
        }
    </script>
</body>
</html>
```

## 🎨 Display Modes

### Inline Mode
Embedded directly in your page content:

```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    propertyId: 'property-123',
    channels: ['airbnb', 'vrbo'],
    displayMode: 'inline',
    theme: 'light'
});
```

### Floating Mode
Fixed position widget that stays visible:

```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    propertyId: 'property-123',
    channels: ['airbnb', 'vrbo'],
    displayMode: 'floating',
    theme: 'dark'
});
```

## 🔧 Configuration

```javascript
const snippet = new RateCompare.RateComparisonSnippet({
    // Required
    propertyId: 'your-property-id',
    channels: ['airbnb', 'vrbo', 'booking', 'expedia'],
    
    // Optional
    displayMode: 'inline',     // 'inline' | 'floating'
    theme: 'light',           // 'light' | 'dark'
    locale: 'en-US'           // Language and region
});
```

### Supported Channels
- `airbnb` - Airbnb listings
- `vrbo` - VRBO/HomeAway listings  
- `booking` - Booking.com listings
- `expedia` - Expedia listings

### Themes
- `light` - Light theme with white background
- `dark` - Dark theme with dark background

## 📱 Framework Integration

### React

```jsx
import React, { useEffect, useRef } from 'react';
import { RateComparisonSnippet } from '@rate-compare/universal-snippet';

const RateCompareWidget = ({ propertyId, channels, checkIn, checkOut }) => {
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

    useEffect(() => {
        if (snippetRef.current && checkIn && checkOut) {
            snippetRef.current.fetchRates(checkIn, checkOut);
        }
    }, [checkIn, checkOut]);

    return <div id="rate-compare-widget" />;
};
```

### Vue.js

```vue
<template>
    <div>
        <input v-model="checkIn" type="date" />
        <input v-model="checkOut" type="date" />
        <button @click="fetchRates">Compare Rates</button>
        <div id="rate-compare-widget"></div>
    </div>
</template>

<script>
import { RateComparisonSnippet } from '@rate-compare/universal-snippet';

export default {
    data() {
        return {
            snippet: null,
            checkIn: '',
            checkOut: ''
        };
    },
    mounted() {
        this.snippet = new RateComparisonSnippet({
            propertyId: 'demo-123',
            channels: ['airbnb', 'vrbo'],
            displayMode: 'inline',
            theme: 'light'
        });
        
        this.snippet.init();
    },
    beforeUnmount() {
        if (this.snippet) {
            this.snippet.teardown();
        }
    },
    methods: {
        async fetchRates() {
            if (this.checkIn && this.checkOut) {
                await this.snippet.fetchRates(this.checkIn, this.checkOut);
            }
        }
    }
};
</script>
```

## 📊 API Reference

### Methods

#### `init(): Promise<void>`
Initialize the widget and inject it into the DOM.

```javascript
await snippet.init();
```

#### `fetchRates(checkIn: string, checkOut: string): Promise<RateData[]>`
Fetch and display rates for the specified date range.

```javascript
const rates = await snippet.fetchRates('2024-01-15', '2024-01-17');
```

#### `configure(newConfig: Partial<RateComparisonConfig>): void`
Update the widget configuration.

```javascript
snippet.configure({
    theme: 'dark',
    displayMode: 'floating'
});
```

#### `on(event: EventType, handler: EventHandler): void`
Add an event listener.

```javascript
snippet.on('rates-loaded', (rates) => {
    console.log('Rates loaded:', rates);
});
```

#### `off(event: EventType, handler: EventHandler): void`
Remove an event listener.

```javascript
snippet.off('rates-loaded', handler);
```

#### `teardown(): void`
Clean up and remove the widget from the DOM.

```javascript
snippet.teardown();
```

### Events

#### `ready`
Emitted when the widget is initialized and ready.

```javascript
snippet.on('ready', () => {
    console.log('Widget ready');
});
```

#### `rates-loaded`
Emitted when rates are successfully fetched and displayed.

```javascript
snippet.on('rates-loaded', (rates) => {
    console.log('Rates:', rates);
});
```

#### `error`
Emitted when an error occurs.

```javascript
snippet.on('error', (error) => {
    console.error('Error:', error);
});
```

#### `teardown`
Emitted when the widget is cleaned up.

```javascript
snippet.on('teardown', () => {
    console.log('Widget removed');
});
```

## 🎨 Styling

The widget uses CSS custom properties for easy theming:

```css
.rate-compare-widget {
    --rate-compare-primary: #007cba;
    --rate-compare-background: #ffffff;
    --rate-compare-text: #333333;
    --rate-compare-border: #e0e0e0;
}
```

### Custom Styling

You can override the default styles:

```css
/* Customize the widget appearance */
.rate-compare-widget {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Customize platform logos */
.rate-compare-platform-logo.airbnb {
    background: linear-gradient(135deg, #FF5A5F 0%, #E31C5F 100%);
}

/* Customize best deal highlighting */
.rate-compare-card.best-deal {
    border-left-color: #28a745;
    background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
}
```

## 🧪 Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
npm run test:coverage
```

### Development Server
```bash
npm run dev
```

### Lint
```bash
npm run lint
npm run lint:fix
```

## 📦 Build Outputs

- `dist/rate-compare.umd.js` - Universal Module Definition (browser compatible)
- `dist/rate-compare.esm.js` - ES Modules (modern bundlers)
- `dist/rate-compare.umd.min.js` - Minified UMD (production)
- `dist/index.d.ts` - TypeScript declarations

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📖 Examples

Check the `examples/` directory for complete integration examples:

- `basic-usage.html` - Simple HTML integration
- `react-example.jsx` - React component
- `vue-example.vue` - Vue.js component
- `config-panel/` - Configuration panel for non-technical users

## 🔒 Security

- No external dependencies in production builds
- CSP-compatible (no inline scripts)
- Input validation and sanitization
- Secure API communication

## 📈 Performance

- **Bundle Size**: < 50KB gzipped
- **Load Time**: < 2 seconds on 3G
- **Caching**: 15-minute localStorage cache
- **Tree Shaking**: Full ES module support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

GPL-2.0-or-later

## 🆘 Support

- Documentation: [README.md](../README.md)
- Issues: [GitHub Issues](https://github.com/g-abate/rate-compare/issues)
- Examples: [examples/](./examples/)

---

**Ready to boost your direct bookings?** Get started with the universal snippet today! 🚀

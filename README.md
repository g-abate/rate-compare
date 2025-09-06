# Rate Compare - Universal Rate Comparison System

A comprehensive rate comparison system for short-term rental properties, available as both a WordPress plugin and a universal JavaScript snippet.

## 🏗️ Monorepo Structure

This repository contains three main packages:

- **`wordpress-plugin/`** - WordPress plugin for rate comparison
- **`universal-snippet/`** - Universal JavaScript snippet for any website
- **`shared/`** - Shared core logic and utilities

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
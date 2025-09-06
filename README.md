# Rate Compare Plugin

A WordPress plugin for comparing short-term rental rates across multiple booking channels including Airbnb, VRBO, Booking.com, and OwnerRez.

[![WordPress Plugin](https://img.shields.io/badge/WordPress-Plugin-blue.svg)](https://wordpress.org/plugins/)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue.svg)](https://php.net/)
[![WordPress Version](https://img.shields.io/badge/WordPress-5.0%2B-blue.svg)](https://wordpress.org/)
[![License](https://img.shields.io/badge/License-GPL%20v2%2B-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
[![Build Status](https://github.com/g-abate/rate-compare/workflows/Required%20Checks/badge.svg)](https://github.com/g-abate/rate-compare/actions)

## 🚀 Features

- **Multi-Channel Rate Comparison**: Compare rates from Airbnb, VRBO, Booking.com, and OwnerRez
- **Real-Time Rate Fetching**: Automatically fetch and update rates from external APIs and web scraping
- **Smart Caching**: 15-minute caching system for optimal performance
- **Admin Interface**: Easy configuration and management of channel settings
- **Responsive Design**: Mobile-friendly rate comparison popup
- **Security First**: Comprehensive input validation and output escaping
- **Translation Ready**: Full internationalization support
- **REST API**: Complete REST API for integration with other systems
- **Shortcode Support**: Easy integration with any page or post
- **AJAX Powered**: Dynamic rate fetching without page reloads

## 📦 Installation

### From WordPress Admin

1. Go to **Plugins** → **Add New**
2. Search for "Rate Compare"
3. Click **Install Now** and then **Activate**

### Manual Installation

1. Download the plugin files
2. Upload to `/wp-content/plugins/rate-compare/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Configure your channel settings in the admin panel

### Via WP-CLI

```bash
wp plugin install rate-compare --activate
```

## ⚙️ Configuration

### Initial Setup

1. Go to **Rate Compare** in your WordPress admin menu
2. Add your property URLs for each channel:
   - **Airbnb**: `https://airbnb.com/rooms/your-listing-id`
   - **VRBO**: `https://vrbo.com/your-listing-url`
   - **Booking.com**: `https://booking.com/your-listing-url`
3. Configure your OwnerRez API credentials
4. Set up rate fetching schedules and caching preferences

### Channel Configuration

#### Airbnb
- Add your Airbnb listing URL
- The plugin will automatically extract the listing ID
- Supports both individual rooms and entire homes

#### VRBO
- Add your VRBO property URL
- Supports both individual properties and property groups
- Automatic property ID extraction

#### Booking.com
- Add your Booking.com property URL
- Supports hotels, apartments, and vacation rentals
- Automatic property ID extraction

#### OwnerRez
- Add your OwnerRez API credentials
- Configure property mappings
- Set up rate fetching schedules

### Advanced Settings

- **Caching**: Configure cache duration (default: 15 minutes)
- **Rate Limiting**: Set request limits to prevent API abuse
- **Error Handling**: Configure retry logic and error notifications
- **Logging**: Enable detailed logging for debugging

## 🎯 Usage

### Shortcode

Display rate comparison on any page or post:

```shortcode
[rate_compare property_id="123" check_in="2024-01-15" check_out="2024-01-20"]
```

### REST API

Get rates programmatically:

```bash
GET /wp-json/rate-compare/v1/rates?property_id=123&check_in=2024-01-15&check_out=2024-01-20
```

### JavaScript API

```javascript
// Initialize rate comparison
const rateCompare = new RateCompare({
    propertyId: 123,
    checkIn: '2024-01-15',
    checkOut: '2024-01-20'
});

// Fetch rates
rateCompare.getRates().then(rates => {
    console.log('Rates:', rates);
});
```

## 📋 Requirements

- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **MySQL**: 5.6 or higher
- **Memory**: 128MB minimum (256MB recommended)
- **Disk Space**: 10MB for plugin files

### Recommended

- **WordPress**: 6.0 or higher
- **PHP**: 8.0 or higher
- **MySQL**: 8.0 or higher
- **Memory**: 256MB or higher
- **Object Caching**: Redis or Memcached

## 🛠️ Development

This plugin follows WordPress coding standards and uses Test-Driven Development (TDD) approach.

### Prerequisites

- WordPress development environment
- PHP 7.4+
- Node.js 18+
- Composer
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/g-abate/rate-compare.git
cd rate-compare

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Set up WordPress test environment
bash tests/bin/install-wp-tests.sh wordpress_test root '' localhost latest

# Run tests
composer test
npm test
npm run test:e2e
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name main
   ```

2. **Follow TDD Approach**
   - Write failing tests first
   - Implement functionality
   - Refactor while keeping tests green

3. **Run Tests**
   ```bash
   composer test
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Branching Strategy

This project uses **GitHub Flow**:

- `main` - Production-ready code
- `feature/*` - New features (e.g., `feature/rate-comparison`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/cache-issue`)
- `hotfix/*` - Critical production fixes

### Testing

- **Unit Tests**: PHPUnit for PHP code
- **Integration Tests**: WordPress test suite
- **End-to-End Tests**: Playwright for browser testing
- **Code Coverage**: Minimum 80% coverage required

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- Write tests for all new functionality
- Update documentation for user-facing changes
- Use conventional commit messages
- Ensure security best practices

## 📄 License

This plugin is licensed under the [GPL v2 or later](LICENSE).

## 🆘 Support

### Getting Help

- **Documentation**: Check our [Wiki](https://github.com/g-abate/rate-compare/wiki)
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/g-abate/rate-compare/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/g-abate/rate-compare/discussions)
- **WordPress.org**: Visit our [plugin page](https://wordpress.org/plugins/rate-compare/) for user support

### Reporting Issues

When reporting issues, please include:

- WordPress version
- PHP version
- Plugin version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Security Issues

For security vulnerabilities, please:

1. **DO NOT** create a public issue
2. Email security concerns to: security@ratecompare.com
3. Include detailed reproduction steps
4. Allow reasonable time for response

## 📈 Roadmap

### Version 1.0.0 (Current)
- ✅ Multi-channel rate comparison
- ✅ Admin interface
- ✅ Caching system
- ✅ Security features
- ✅ REST API
- ✅ Shortcode support

### Version 1.1.0 (Planned)
- 🔄 Additional booking channels
- 🔄 Advanced filtering options
- 🔄 Rate history tracking
- 🔄 Export functionality

### Version 1.2.0 (Planned)
- 🔄 Machine learning rate predictions
- 🔄 Advanced analytics
- 🔄 Custom rate rules
- 🔄 Integration with property management systems

## 🏆 Credits

- **Lead Developer**: [Your Name](https://github.com/your-username)
- **Contributors**: [See all contributors](https://github.com/g-abate/rate-compare/graphs/contributors)
- **WordPress Community**: For the amazing platform and ecosystem
- **Open Source Libraries**: See [composer.json](composer.json) and [package.json](package.json)

## 📊 Statistics

- **Downloads**: [![WordPress Plugin Downloads](https://img.shields.io/wordpress/plugin/dt/rate-compare.svg)](https://wordpress.org/plugins/rate-compare/)
- **Active Installs**: [![WordPress Plugin Active Installs](https://img.shields.io/wordpress/plugin/installs/rate-compare.svg)](https://wordpress.org/plugins/rate-compare/)
- **Rating**: [![WordPress Plugin Rating](https://img.shields.io/wordpress/plugin/rating/rate-compare.svg)](https://wordpress.org/plugins/rate-compare/)
- **Last Updated**: [![WordPress Plugin Last Updated](https://img.shields.io/wordpress/plugin/last-updated/rate-compare.svg)](https://wordpress.org/plugins/rate-compare/)

## 🔗 Links

- **Plugin Page**: [WordPress.org](https://wordpress.org/plugins/rate-compare/)
- **GitHub Repository**: [github.com/g-abate/rate-compare](https://github.com/g-abate/rate-compare)
- **Documentation**: [Wiki](https://github.com/g-abate/rate-compare/wiki)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Made with ❤️ for the WordPress community**

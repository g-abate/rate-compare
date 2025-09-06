# Rate Compare Plugin

A WordPress plugin for comparing short-term rental rates across multiple booking channels including Airbnb, VRBO, Booking.com, and OwnerRez.

## Features

- **Multi-Channel Rate Comparison**: Compare rates from Airbnb, VRBO, Booking.com, and OwnerRez
- **Real-Time Rate Fetching**: Automatically fetch and update rates from external APIs and web scraping
- **Smart Caching**: 15-minute caching system for optimal performance
- **Admin Interface**: Easy configuration and management of channel settings
- **Responsive Design**: Mobile-friendly rate comparison popup
- **Security First**: Comprehensive input validation and output escaping
- **Translation Ready**: Full internationalization support

## Installation

1. Download the plugin files
2. Upload to `/wp-content/plugins/rate-compare/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Configure your channel settings in the admin panel

## Configuration

1. Go to **Rate Compare** in your WordPress admin menu
2. Add your property URLs for each channel (Airbnb, VRBO, Booking.com)
3. Configure your OwnerRez API credentials
4. Set up rate fetching schedules and caching preferences

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher

## Development

This plugin follows WordPress coding standards and uses Test-Driven Development (TDD) approach.

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/your-username/rate-compare.git
cd rate-compare

# Install dependencies
composer install
npm install

# Run tests
composer test
npm test
```

### Branching Strategy

This project uses GitHub Flow:
- `main` - Production-ready code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This plugin is licensed under the GPL v2 or later.

## Support

For support, please open an issue on GitHub or contact the plugin author.

## Changelog

### 1.0.0
- Initial release
- Multi-channel rate comparison
- Admin interface
- Caching system
- Security features

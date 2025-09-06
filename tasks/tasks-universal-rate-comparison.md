# Task List: Universal Rate Comparison System (WordPress Plugin + Universal Snippet)

## Relevant Files

### WordPress Plugin Files
- `wordpress-plugin/rate-compare.php` - Main WordPress plugin file with headers and initialization
- `wordpress-plugin/uninstall.php` - Plugin uninstall cleanup script
- `wordpress-plugin/includes/class-rate-compare.php` - Core WordPress plugin class
- `wordpress-plugin/includes/class-rate-compare-admin.php` - WordPress admin functionality
- `wordpress-plugin/includes/class-rate-compare-public.php` - WordPress frontend functionality
- `wordpress-plugin/admin/partials/settings-page.php` - Admin settings page template
- `wordpress-plugin/admin/css/admin.css` - Admin-specific styling
- `wordpress-plugin/public/partials/rate-comparison-display.php` - Rate comparison display template
- `wordpress-plugin/public/js/rate-comparison.js` - WordPress-specific JavaScript
- `wordpress-plugin/public/css/rate-comparison.css` - WordPress-specific styling

### Universal Snippet Files
- `universal-snippet/src/rate-comparison-snippet.js` - Main universal JavaScript snippet
- `universal-snippet/dist/rate-comparison.min.js` - Minified production build
- `universal-snippet/dist/rate-comparison.css` - Universal CSS styles
- `universal-snippet/config-panel/index.html` - Web-based configuration panel
- `universal-snippet/config-panel/js/config-panel.js` - Configuration panel JavaScript
- `universal-snippet/config-panel/css/config-panel.css` - Configuration panel styling
- `universal-snippet/examples/integration-examples.html` - Integration examples for different platforms

### Shared Core Files
- `shared/src/rate-fetchers/airbnb-fetcher.js` - Airbnb rate fetching logic
- `shared/src/rate-fetchers/vrbo-fetcher.js` - VRBO rate fetching logic
- `shared/src/rate-fetchers/booking-fetcher.js` - Booking.com rate fetching logic
- `shared/src/rate-fetchers/expedia-fetcher.js` - Expedia rate fetching logic
- `shared/src/rate-fetchers/rate-fetcher-factory.js` - Factory for creating rate fetchers
- `shared/src/data-models/rate-data.js` - Rate data models and validation
- `shared/src/data-models/property-config.js` - Property configuration models
- `shared/src/cache/rate-cache.js` - Caching logic for both platforms
- `shared/src/comparison/rate-comparison.js` - Rate comparison calculation logic
- `shared/src/utils/date-utils.js` - Date handling utilities
- `shared/src/utils/validation.js` - Input validation utilities
- `shared/src/api/rate-api.js` - API endpoints for rate fetching
- `shared/src/api/config-api.js` - Configuration management API

### Test Files
- `shared/tests/rate-fetchers/airbnb-fetcher.test.js` - Airbnb fetcher unit tests
- `shared/tests/rate-fetchers/vrbo-fetcher.test.js` - VRBO fetcher unit tests
- `shared/tests/rate-fetchers/booking-fetcher.test.js` - Booking.com fetcher unit tests
- `shared/tests/rate-fetchers/expedia-fetcher.test.js` - Expedia fetcher unit tests
- `shared/tests/data-models/rate-data.test.js` - Rate data model tests
- `shared/tests/comparison/rate-comparison.test.js` - Rate comparison logic tests
- `shared/tests/cache/rate-cache.test.js` - Cache functionality tests
- `wordpress-plugin/tests/test-rate-compare-core.php` - WordPress plugin unit tests
- `universal-snippet/tests/rate-comparison-snippet.test.js` - Universal snippet tests
- `tests/e2e/wordpress-integration.spec.js` - WordPress E2E tests
- `tests/e2e/universal-snippet.spec.js` - Universal snippet E2E tests

### Build and Configuration Files
- `package.json` - Root package.json for monorepo management with workspaces
- `shared/package.json` - Shared library dependencies and build configuration
- `universal-snippet/package.json` - Universal snippet dependencies and build configuration
- `wordpress-plugin/composer.json` - PHP dependencies for WordPress plugin
- `wordpress-plugin/phpunit.xml.dist` - PHP testing configuration
- `shared/rollup.config.js` - Build configuration for shared library
- `universal-snippet/rollup.config.js` - Build configuration for universal snippet
- `.github/workflows/ci.yml` - Continuous integration workflow
- `.github/workflows/deploy.yml` - Deployment workflow

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run JavaScript tests and `composer test` to run PHP tests
- The shared directory contains core logic that both WordPress plugin and universal snippet will use
- Configuration panel will be a separate web application for non-technical users
- Universal snippet will be distributed via CDN and npm package

## Tasks

- [x] 1.0 Monorepo Structure Setup
  - [x] 1.1 Restructure existing repository into monorepo with wordpress-plugin/, universal-snippet/, and shared/ directories
  - [x] 1.2 Move existing WordPress plugin files to wordpress-plugin/ directory
  - [x] 1.3 Create universal-snippet/ directory structure with src/, dist/, config-panel/, and examples/
  - [x] 1.4 Create shared/ directory for common core logic
  - [x] 1.5 Update root package.json for monorepo management with workspaces
  - [x] 1.6 Create shared package.json for common dependencies
  - [x] 1.7 Update .gitignore for monorepo structure
  - [x] 1.8 Create root-level build scripts and configuration

- [ ] 2.0 Test-Driven Development Infrastructure
  - [ ] 2.1 Set up PHPUnit testing framework with WordPress test environment
  - [ ] 2.2 Create test bootstrap and configuration files (phpunit.xml.dist, tests/bootstrap.php)
  - [ ] 2.3 Set up GitHub Actions workflow for automated testing (.github/workflows/test.yml)
  - [ ] 2.4 Configure required status checks for pull requests
  - [ ] 2.5 Set up automated code quality checks (PHPCS, PHPStan, ESLint)
  - [ ] 2.6 Set up JavaScript testing framework (Jest) for universal snippet
  - [ ] 2.7 Create shared test utilities and mocking helpers

- [ ] 3.0 Core Architecture (TDD Approach)
  - [ ] 3.1 Write failing unit tests for core plugin class (TDD Red phase)
  - [ ] 3.2 Create core plugin class (Rate_Compare) with singleton pattern and initialization
  - [ ] 3.3 Implement WordPress hooks for plugin loading and integration
  - [ ] 3.4 Refactor core class while keeping tests green (TDD Refactor phase)
  - [ ] 3.5 Write failing unit tests for universal snippet core (TDD Red phase)
  - [ ] 3.6 Create universal snippet core class with initialization
  - [ ] 3.7 Implement snippet auto-detection and initialization
  - [ ] 3.8 Refactor snippet core while keeping tests green (TDD Refactor phase)

- [ ] 4.0 Database Schema and Data Management
  - [ ] 4.1 Write failing unit tests for database operations (TDD Red phase)
  - [ ] 4.2 Implement database schema for storing channel configurations using dbDelta
  - [ ] 4.3 Create Rate_Compare_Database class for database operations
  - [ ] 4.4 Implement database query optimization and indexing
  - [ ] 4.5 Refactor database code while keeping tests green (TDD Refactor phase)
  - [ ] 4.6 Create shared data models for rate data, property configuration, and channel data
  - [ ] 4.7 Implement shared validation utilities for input sanitization and data validation

- [ ] 5.0 Shared Core Infrastructure
  - [ ] 5.1 Create shared date utilities for date handling and formatting
  - [ ] 5.2 Build shared error handling and logging system
  - [ ] 5.3 Create shared API client for external service communication
  - [ ] 5.4 Implement shared caching layer with localStorage and server-side options
  - [ ] 5.5 Create shared configuration management system
  - [ ] 5.6 Build shared rate comparison calculation logic

- [ ] 6.0 Universal Snippet Implementation
  - [ ] 6.1 Create core universal snippet JavaScript file with vanilla JS (no dependencies)
  - [ ] 6.2 Implement snippet initialization and auto-detection of date pickers
  - [ ] 6.3 Build inline widget display mode with responsive design
  - [ ] 6.4 Implement floating button display mode as alternative option
  - [ ] 6.5 Create CSS custom properties system for easy theming
  - [ ] 6.6 Build date selection integration for common date picker libraries
  - [ ] 6.7 Implement manual date selection API for custom implementations
  - [ ] 6.8 Create snippet configuration via data attributes and JavaScript options
  - [ ] 6.9 Build error handling and fallback mechanisms
  - [ ] 6.10 Implement progressive enhancement (works without JavaScript)

- [ ] 7.0 Configuration Management System
  - [ ] 7.1 Create web-based configuration panel for non-technical users
  - [ ] 7.2 Build property listing management interface with URL validation
  - [ ] 7.3 Implement configuration token generation and management
  - [ ] 7.4 Create channel testing and validation tools
  - [ ] 7.5 Build configuration preview and testing functionality
  - [ ] 7.6 Implement configuration import/export functionality
  - [ ] 7.7 Create user authentication and property ownership verification
  - [ ] 7.8 Build configuration API endpoints for snippet integration

- [ ] 8.0 Rate Fetching System
  - [ ] 8.1 Create Airbnb rate fetcher with web scraping and API fallback
  - [ ] 8.2 Build VRBO rate fetcher with web scraping and API fallback
  - [ ] 8.3 Implement Booking.com rate fetcher with web scraping and API fallback
  - [ ] 8.4 Create Expedia rate fetcher with web scraping and API fallback
  - [ ] 8.5 Build rate fetcher factory for dynamic channel selection
  - [ ] 8.6 Implement rate data normalization and validation
  - [ ] 8.7 Create rate fetching queue system with rate limiting
  - [ ] 8.8 Build comprehensive error handling and retry mechanisms
  - [ ] 8.9 Implement rate caching with TTL and invalidation
  - [ ] 8.10 Create rate fetching for date ranges and availability

- [ ] 9.0 User Interface Development
  - [ ] 9.1 Design and implement universal snippet UI components
  - [ ] 9.2 Create responsive CSS framework with mobile-first approach
  - [ ] 9.3 Build loading states and animations
  - [ ] 9.4 Implement accessibility features (WCAG 2.1 AA compliance)
  - [ ] 9.5 Create channel logo and branding display system
  - [ ] 9.6 Build savings calculation and highlighting display
  - [ ] 9.7 Implement total cost breakdown including fees
  - [ ] 9.8 Create error states and user feedback messages
  - [ ] 9.9 Build configuration panel UI with intuitive design
  - [ ] 9.10 Implement theming and customization options

- [ ] 10.0 Testing and Quality Assurance
  - [ ] 10.1 Create unit tests for all shared core functionality
  - [ ] 10.2 Build unit tests for rate fetchers and comparison logic
  - [ ] 10.3 Implement unit tests for universal snippet components
  - [ ] 10.4 Create integration tests for configuration management
  - [ ] 10.5 Build end-to-end tests for complete user workflows
  - [ ] 10.6 Implement cross-browser compatibility testing
  - [ ] 10.7 Create performance testing and optimization
  - [ ] 10.8 Build security testing and vulnerability scanning
  - [ ] 10.9 Implement code coverage reporting with minimum 80% coverage

- [ ] 11.0 Build and Deployment Pipeline
  - [ ] 11.1 Set up Webpack/Rollup build system for universal snippet
  - [ ] 11.2 Create minification and optimization pipeline
  - [ ] 11.3 Build CDN deployment configuration
  - [ ] 11.4 Set up npm package publishing workflow
  - [ ] 11.5 Create automated testing pipeline with GitHub Actions
  - [ ] 11.6 Implement automated deployment for configuration panel
  - [ ] 11.7 Set up monitoring and error tracking
  - [ ] 11.8 Create release management and versioning system

- [ ] 12.0 WordPress Plugin Implementation
  - [ ] 12.1 Build WordPress admin interface using shared configuration system
  - [ ] 12.2 Create WordPress-specific rate fetching integration
  - [ ] 12.3 Implement WordPress hooks and filters for plugin integration
  - [ ] 12.4 Build WordPress-specific caching using transients
  - [ ] 12.5 Create WordPress shortcodes and widgets
  - [ ] 12.6 Implement WordPress REST API endpoints
  - [ ] 12.7 Build WordPress-specific frontend display components
  - [ ] 12.8 Create WordPress plugin testing and quality assurance

- [ ] 13.0 Documentation and Examples
  - [ ] 13.1 Create comprehensive installation guides for both platforms
  - [ ] 13.2 Build configuration documentation and tutorials
  - [ ] 13.3 Create integration examples for different website platforms
  - [ ] 13.4 Build API documentation for developers
  - [ ] 13.5 Create troubleshooting guides and FAQ
  - [ ] 13.6 Build video tutorials for non-technical users
  - [ ] 13.7 Create developer documentation and code examples
  - [ ] 13.8 Build WordPress.org plugin readme and screenshots

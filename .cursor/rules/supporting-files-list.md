# Supporting Files for WordPress Plugin Development

## Required Configuration Files

### Testing Configuration
- `phpunit.xml.dist` - PHPUnit test configuration
- `tests/bootstrap.php` - Test environment setup
- `tests/test-*.php` - Unit test files
- `tests/e2e/` - End-to-end test files
- `playwright.config.js` - E2E testing configuration

### Code Quality
- `phpcs.xml` - PHP CodeSniffer configuration
- `composer.json` - PHP dependencies and scripts
- `package.json` - Node.js dependencies and build scripts
- `webpack.config.js` - Asset bundling configuration
- `.eslintrc.js` - JavaScript linting rules
- `.stylelintrc.js` - CSS/SCSS linting rules

### CI/CD Pipeline
- `.github/workflows/test.yml` - Main test workflow
- `.github/workflows/ai-pr-review.yml` - AI-powered PR review
- `.github/workflows/required-checks.yml` - Required status checks
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template

### Development Environment
- `.wp-env.json` - Local WordPress development environment
- `.gitignore` - Git ignore patterns
- `.editorconfig` - Editor configuration
- `README.md` - Project documentation
- `readme.txt` - WordPress.org plugin readme

## File Templates

### phpunit.xml.dist
```xml
<?xml version="1.0"?>
<phpunit
    bootstrap="tests/bootstrap.php"
    backupGlobals="false"
    colors="true"
    convertErrorsToExceptions="true"
    convertNoticesToExceptions="true"
    convertWarningsToExceptions="true"
    processIsolation="false"
    stopOnFailure="false"
    syntaxCheck="false"
>
    <testsuites>
        <testsuite name="Plugin Slug Tests">
            <directory>tests/</directory>
        </testsuite>
    </testsuites>
    
    <filter>
        <whitelist>
            <directory suffix=".php">includes/</directory>
            <directory suffix=".php">admin/</directory>
            <directory suffix=".php">public/</directory>
            <exclude>
                <directory>tests/</directory>
                <directory>vendor/</directory>
            </exclude>
        </whitelist>
    </filter>
</phpunit>
```

### tests/bootstrap.php
```php
<?php
/**
 * PHPUnit bootstrap file
 */

// Load WordPress test environment
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
    $_tests_dir = '/tmp/wordpress-tests-lib';
}

require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin() {
    require dirname( dirname( __FILE__ ) ) . '/plugin-slug.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';
```

### phpcs.xml
```xml
<?xml version="1.0"?>
<ruleset name="Plugin Slug">
    <description>WordPress coding standards for Plugin Slug</description>
    
    <file>includes/</file>
    <file>admin/</file>
    <file>public/</file>
    <file>plugin-slug.php</file>
    
    <exclude-pattern>*/vendor/*</exclude-pattern>
    <exclude-pattern>*/tests/*</exclude-pattern>
    
    <rule ref="WordPress">
        <exclude name="Generic.Commenting.DocComment.MissingShort"/>
        <exclude name="Squiz.Commenting.FunctionComment.MissingParamComment"/>
    </rule>
    
    <rule ref="WordPress.NamingConventions.PrefixAllGlobals">
        <properties>
            <property name="prefixes" type="array" value="plugin_slug,PLUGIN_SLUG"/>
        </properties>
    </rule>
</ruleset>
```

### composer.json
```json
{
    "name": "yourname/plugin-slug",
    "description": "WordPress plugin for rate comparison",
    "type": "wordpress-plugin",
    "license": "GPL-2.0-or-later",
    "authors": [
        {
            "name": "Your Name",
            "email": "your.email@example.com"
        }
    ],
    "require": {
        "php": ">=7.4"
    },
    "require-dev": {
        "phpunit/phpunit": "^9.0",
        "squizlabs/php_codesniffer": "^3.6",
        "wp-coding-standards/wpcs": "^2.3",
        "phpstan/phpstan": "^1.0",
        "brain/monkey": "^2.6"
    },
    "scripts": {
        "test": "phpunit",
        "test:coverage": "phpunit --coverage-html coverage",
        "lint": "phpcs",
        "lint:fix": "phpcbf",
        "analyze": "phpstan analyse",
        "post-install-cmd": [
            "vendor/bin/phpcs --config-set installed_paths vendor/wp-coding-standards/wpcs"
        ]
    },
    "autoload": {
        "psr-4": {
            "Plugin_Slug\\": "includes/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Plugin_Slug\\Tests\\": "tests/"
        }
    }
}
```

### package.json
```json
{
    "name": "plugin-slug",
    "version": "1.0.0",
    "description": "WordPress plugin for rate comparison",
    "scripts": {
        "build": "webpack --mode=production",
        "dev": "webpack --mode=development --watch",
        "lint:js": "eslint assets/src/js/**/*.js",
        "lint:css": "stylelint assets/src/scss/**/*.scss",
        "test": "jest",
        "test:e2e": "playwright test"
    },
    "devDependencies": {
        "@babel/core": "^7.22.0",
        "@babel/preset-env": "^7.22.0",
        "babel-loader": "^9.1.0",
        "eslint": "^8.42.0",
        "eslint-config-wordpress": "^2.0.0",
        "file-loader": "^6.2.0",
        "sass": "^1.62.0",
        "sass-loader": "^13.3.0",
        "stylelint": "^15.10.0",
        "stylelint-config-wordpress": "^20.0.0",
        "webpack": "^5.84.0",
        "webpack-cli": "^5.1.0",
        "@playwright/test": "^1.40.0"
    }
}
```

### .github/workflows/test.yml
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  php-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php-version: [7.4, 8.0, 8.1, 8.2]
        wordpress-version: [5.0, 6.0, 6.4]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: ${{ matrix.php-version }}
        extensions: mbstring, xml, ctype, iconv, intl, pdo_mysql, dom, filter, gd, json, libxml, mbstring, pdo, tokenizer, xml, zip
    
    - name: Setup WordPress
      run: |
        bash tests/bin/install-wp-tests.sh wordpress_test root '' localhost ${{ matrix.wordpress-version }}
    
    - name: Install dependencies
      run: composer install --no-progress --prefer-dist --optimize-autoloader
    
    - name: Run PHPUnit tests
      run: vendor/bin/phpunit --coverage-clover=coverage.xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  js-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint:js
    
    - name: Run tests
      run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
```

### .github/PULL_REQUEST_TEMPLATE.md
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)
- [ ] Mobile testing (if applicable)

## Security Considerations
- [ ] Input validation implemented
- [ ] Output escaping applied
- [ ] Nonce verification added
- [ ] Capability checks included
- [ ] SQL injection prevention verified

## Screenshots (if applicable)
Before and after screenshots for UI changes.

## Checklist
- [ ] Code follows WordPress coding standards
- [ ] Self-review completed
- [ ] Code is properly commented
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Performance impact assessed

## Related Issues
Closes #123
Related to #456
```

### .wp-env.json
```json
{
    "core": "WordPress/WordPress#trunk",
    "phpVersion": "8.1",
    "plugins": [
        "."
    ],
    "themes": [
        "WordPress/twentytwentythree"
    ],
    "mappings": {
        "wp-content/plugins/plugin-slug": "."
    },
    "config": {
        "WP_DEBUG": true,
        "WP_DEBUG_LOG": true,
        "WP_DEBUG_DISPLAY": false,
        "SCRIPT_DEBUG": true
    }
}
```

### .gitignore
```gitignore
# Dependencies
/vendor/
/node_modules/

# Build artifacts
/assets/dist/
/build/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
error_log

# Coverage reports
/coverage/
*.coverage

# Environment files
.env
.env.local

# WordPress files
wp-config.php
wp-content/uploads/

# Test files
/tests/bin/
/tests/wordpress/
/tests/wordpress-tests-lib/
```

## Installation Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/plugin-slug.git
   cd plugin-slug
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Build assets**:
   ```bash
   npm run build
   ```

5. **Set up local WordPress environment**:
   ```bash
   npx @wordpress/env start
   ```

6. **Run tests**:
   ```bash
   composer test
   npm test
   ```

## Notes for Cursor

When future tasks are requested, consult these rules first and adhere strictly to the patterns and standards defined in the `.cursor/rules/*.mdc` files.

If a generated change violates a rule, propose a correction before proceeding.

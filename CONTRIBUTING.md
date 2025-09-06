# Contributing to Rate Compare Plugin

Thank you for your interest in contributing to the Rate Compare Plugin! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Release Process](#release-process)

## Code of Conduct

This project follows the [WordPress Code of Conduct](https://wordpress.org/about/conduct/). By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher
- Node.js 18+ (for development)
- Composer (for PHP dependencies)
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/rate-compare.git
   cd rate-compare
   ```

2. **Install Dependencies**
   ```bash
   # PHP dependencies
   composer install
   
   # Node.js dependencies
   npm install
   ```

3. **Set Up WordPress Test Environment**
   ```bash
   # Install WordPress test suite
   bash tests/bin/install-wp-tests.sh wordpress_test root '' localhost latest
   ```

4. **Run Tests**
   ```bash
   # PHP tests
   composer test
   
   # JavaScript tests
   npm test
   
   # End-to-end tests
   npm run test:e2e
   ```

## Development Workflow

### Branching Strategy

We use **GitHub Flow**:

- `main` - Production-ready code
- `feature/*` - New features (e.g., `feature/rate-comparison`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/cache-issue`)
- `hotfix/*` - Critical production fixes

### Creating a Feature

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name main
   ```

2. **Follow TDD Approach**
   - Write failing tests first
   - Implement functionality
   - Refactor while keeping tests green

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

## Coding Standards

### PHP Standards

- Follow [WordPress PHP Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- Use PHP 7.4+ features
- All functions prefixed with `rate_compare_`
- All classes prefixed with `Rate_Compare_`
- Use type declarations where possible

### JavaScript Standards

- Follow [WordPress JavaScript Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/javascript/)
- Use ES6+ features
- Use JSDoc for documentation
- Follow WordPress naming conventions

### CSS Standards

- Follow [WordPress CSS Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/css/)
- Use BEM methodology
- Mobile-first responsive design
- Use CSS custom properties for theming

## Testing Guidelines

### Test-Driven Development (TDD)

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

### Test Types

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

### Running Tests

```bash
# All tests
composer test

# Specific test file
vendor/bin/phpunit tests/unit/test-rate-compare-core.php

# With coverage
vendor/bin/phpunit --coverage-html coverage/

# JavaScript tests
npm test

# E2E tests
npm run test:e2e
```

### Test Requirements

- Minimum 80% code coverage
- All tests must pass before PR merge
- New features require corresponding tests
- Bug fixes require regression tests

## Pull Request Process

### Before Submitting

- [ ] Code follows WordPress coding standards
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Security considerations addressed

### PR Template

Use the provided pull request template:

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Security Considerations
- [ ] Input validation implemented
- [ ] Output escaping applied
- [ ] Nonce verification added
- [ ] Capability checks included

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one team member review
3. **Security Review**: Security-sensitive changes require security review
4. **Final Approval**: Maintainer approval required

## Issue Reporting

### Bug Reports

Use the bug report template and include:

- WordPress version
- PHP version
- Plugin version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests

Use the feature request template and include:

- Problem description
- Proposed solution
- Use cases
- Screenshots/mockups if applicable

## Security

### Security Guidelines

- **Input Validation**: Sanitize all user input
- **Output Escaping**: Escape all output
- **Nonce Verification**: Verify nonces for forms and AJAX
- **Capability Checks**: Check user capabilities
- **SQL Injection**: Use prepared statements
- **XSS Prevention**: Escape output and validate input

### Reporting Security Issues

For security vulnerabilities, please:

1. **DO NOT** create a public issue
2. Email security concerns to: security@ratecompare.com
3. Include detailed reproduction steps
4. Allow reasonable time for response

## Release Process

### Version Numbering

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

### Release Checklist

- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Translation files updated

## Documentation

### Code Documentation

- Use PHPDoc for PHP functions and classes
- Use JSDoc for JavaScript functions
- Document all hooks and filters
- Include usage examples

### User Documentation

- Update README.md for user-facing changes
- Update inline code comments
- Create/update help documentation
- Update translation files

## Translation

### Adding Translations

1. Update `.pot` file with new strings
2. Create translation files for target languages
3. Test translations in WordPress admin
4. Submit translations for review

### Translation Guidelines

- Use descriptive text domain: `rate-compare`
- Provide context for translators
- Use placeholders for dynamic content
- Test with RTL languages

## Getting Help

### Resources

- [WordPress Developer Documentation](https://developer.wordpress.org/)
- [Plugin Developer Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WordPress Test Suite](https://make.wordpress.org/core/handbook/testing/automated-testing/)

### Community

- GitHub Issues: For bug reports and feature requests
- GitHub Discussions: For questions and general discussion
- WordPress.org Support: For user support

## License

This project is licensed under the GPL v2 or later. By contributing, you agree that your contributions will be licensed under the same license.

## Thank You

Thank you for contributing to the Rate Compare Plugin! Your contributions help make short-term rental rate comparison better for everyone.

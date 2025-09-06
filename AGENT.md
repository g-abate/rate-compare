# Rate Compare Plugin - AI Agent Guidelines

## Project Overview

This is a WordPress plugin for comparing short-term rental rates across multiple booking channels (Airbnb, VRBO, Booking.com, OwnerRez). The plugin follows WordPress coding standards and uses Test-Driven Development (TDD) approach.

## Code Review Guidelines

### WordPress Standards Compliance

- **PHP Coding Standards**: Follow [WordPress PHP Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- **Function Naming**: All functions prefixed with `rate_compare_`
- **Class Naming**: All classes prefixed with `Rate_Compare_`
- **Text Domain**: Use `rate-compare` for all internationalization
- **Hooks**: Use WordPress hooks, actions, and filters appropriately

### Security Requirements (Critical)

1. **Input Validation**:
   - Sanitize all user input with `sanitize_text_field()`, `sanitize_email()`, etc.
   - Validate data types and ranges
   - Use `wp_verify_nonce()` for all forms and AJAX requests

2. **Output Escaping**:
   - Use `esc_html()`, `esc_attr()`, `esc_url()` for output
   - Use `wp_kses()` for allowed HTML content
   - Never use `echo` with unescaped variables

3. **Database Security**:
   - Use `$wpdb->prepare()` for all SQL queries
   - Never concatenate user input into SQL queries
   - Use WordPress database abstraction layer

4. **File Operations**:
   - Validate file uploads with `wp_check_filetype()`
   - Use `wp_upload_dir()` for file paths
   - Check file permissions and ownership

5. **User Permissions**:
   - Use `current_user_can()` for capability checks
   - Verify user permissions before state-changing operations
   - Use `is_admin()` checks appropriately

### Plugin Architecture

1. **Main Plugin File** (`rate-compare.php`):
   - Must have proper WordPress headers
   - Include security guards (`if (!defined('ABSPATH')) exit;`)
   - Use singleton pattern for main class
   - Register activation/deactivation hooks

2. **Class Structure**:
   - Use proper namespacing and autoloading
   - Follow WordPress class naming conventions
   - Implement proper error handling
   - Use dependency injection where appropriate

3. **Database Operations**:
   - Use `dbDelta()` for table creation/updates
   - Implement proper database versioning
   - Use WordPress options API for settings
   - Implement proper cleanup on uninstall

### Performance Considerations

1. **Caching**:
   - Use WordPress transients for temporary data
   - Implement proper cache invalidation
   - Use object caching when available
   - Cache expensive operations

2. **Database Queries**:
   - Minimize database calls
   - Use prepared statements
   - Implement proper indexing
   - Use `WP_Query` for complex queries

3. **Asset Loading**:
   - Load scripts/styles only when needed
   - Use `wp_enqueue_script()` and `wp_enqueue_style()`
   - Implement proper dependency management
   - Minify and compress assets

### Testing Requirements

1. **Unit Tests**:
   - Test all public methods
   - Mock external dependencies
   - Test error conditions
   - Achieve minimum 80% code coverage

2. **Integration Tests**:
   - Test WordPress integration
   - Test database operations
   - Test API integrations
   - Test user workflows

3. **Security Tests**:
   - Test input validation
   - Test output escaping
   - Test permission checks
   - Test nonce verification

### Code Quality Standards

1. **Documentation**:
   - Use PHPDoc for all functions and classes
   - Document parameters and return values
   - Include usage examples
   - Document hooks and filters

2. **Error Handling**:
   - Use `WP_Error` for error reporting
   - Implement proper logging
   - Handle edge cases gracefully
   - Provide meaningful error messages

3. **Code Organization**:
   - Keep functions focused and small
   - Use meaningful variable names
   - Avoid code duplication
   - Follow DRY principles

### API Integration Guidelines

1. **External APIs**:
   - Implement proper rate limiting
   - Use `wp_remote_get()` and `wp_remote_post()`
   - Handle API errors gracefully
   - Implement retry logic with exponential backoff

2. **REST API Endpoints**:
   - Use proper authentication
   - Implement permission checks
   - Validate input parameters
   - Return proper HTTP status codes

3. **AJAX Endpoints**:
   - Verify nonces
   - Check user capabilities
   - Sanitize input
   - Return JSON responses

### Internationalization

1. **Text Domain**: Always use `rate-compare`
2. **String Translation**: Wrap all user-facing strings with `__()`, `_e()`, etc.
3. **Context**: Provide context for translators when needed
4. **Pluralization**: Use `_n()` for plural strings
5. **Date/Time**: Use WordPress date/time functions

### Common Issues to Flag

1. **Security Vulnerabilities**:
   - Unescaped output
   - Unvalidated input
   - SQL injection risks
   - Missing nonce verification
   - Insufficient permission checks

2. **WordPress Violations**:
   - Direct database queries without `$wpdb`
   - Missing WordPress hooks
   - Incorrect function naming
   - Missing text domain

3. **Performance Issues**:
   - N+1 database queries
   - Missing caching
   - Inefficient loops
   - Unnecessary file operations

4. **Code Quality Issues**:
   - Missing documentation
   - Poor error handling
   - Code duplication
   - Unclear variable names

### Review Checklist

When reviewing code, ensure:

- [ ] WordPress coding standards compliance
- [ ] Proper input validation and output escaping
- [ ] Nonce verification for forms and AJAX
- [ ] Capability checks for admin functions
- [ ] Proper error handling and logging
- [ ] Database queries use prepared statements
- [ ] Internationalization with correct text domain
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Code is well-documented and readable

### Project-Specific Context

- **Plugin Slug**: `rate-compare`
- **Text Domain**: `rate-compare`
- **Main Class**: `Rate_Compare`
- **Database Tables**: Use `rate_compare_` prefix
- **Options**: Use `rate_compare_` prefix
- **Transients**: Use `rate_compare_` prefix
- **Hooks**: Use `rate_compare_` prefix

This plugin is designed for short-term rental property managers who need to compare rates across multiple booking channels. Security and performance are critical as this will handle financial data and external API integrations.

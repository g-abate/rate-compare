# Pull Request

## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test improvements

## TDD Checklist
- [ ] **Red Phase**: Written failing tests first
- [ ] **Green Phase**: Implemented minimal code to make tests pass
- [ ] **Refactor Phase**: Improved code while keeping tests green
- [ ] All new functionality is covered by tests
- [ ] Existing tests still pass
- [ ] Code coverage maintained or improved

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] All tests pass locally

## Code Quality
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] No console.log statements left in code
- [ ] No TODO comments left in code

## WordPress Plugin Specific (if applicable)
- [ ] PHPCS passes
- [ ] PHPStan analysis passes
- [ ] WordPress coding standards followed
- [ ] No direct database queries (using $wpdb->prepare)
- [ ] Proper sanitization and escaping
- [ ] Nonces used for forms/AJAX

## Universal Snippet Specific (if applicable)
- [ ] ESLint passes
- [ ] TypeScript compilation passes
- [ ] Bundle size within limits
- [ ] No breaking changes to public API
- [ ] Browser compatibility maintained

## Documentation
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Code comments added for complex logic
- [ ] Changelog updated (if applicable)

## Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Output escaping implemented
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

## Performance
- [ ] No performance regressions
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
- [ ] Bundle size impact assessed

## Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes documented
- [ ] Migration guide provided (if applicable)

## Related Issues
Closes #(issue number)

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information that reviewers should know.
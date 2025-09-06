# Test-Driven Development (TDD) Workflow

This document outlines our TDD process and GitHub Flow for the Rate Compare project.

## TDD Process

### The Red-Green-Refactor Cycle

1. **🔴 Red Phase**: Write a failing test
   - Write a test that describes the desired functionality
   - Run the test to confirm it fails
   - Commit the failing test

2. **🟢 Green Phase**: Write minimal code to pass
   - Write the simplest code that makes the test pass
   - Run the test to confirm it passes
   - Commit the working code

3. **🔵 Refactor Phase**: Improve the code
   - Refactor the code while keeping tests green
   - Run tests to ensure nothing breaks
   - Commit the refactored code

### TDD Rules

- **Never write production code without a failing test**
- **Never write more of a test than is sufficient to fail**
- **Never write more production code than is sufficient to pass the test**
- **One failing test at a time**
- **One assertion per test (when possible)**

## GitHub Flow

### Branch Structure

- `main` - Production-ready code (always deployable)
- `feature/*` - Feature branches (e.g., `feature/rate-fetcher-airbnb`)
- `bugfix/*` - Bug fix branches (e.g., `bugfix/date-parsing-issue`)

### Workflow Steps

1. **Create Feature Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Follow TDD Process**
   - Write failing test
   - Implement minimal code
   - Refactor
   - Repeat

3. **Commit Frequently**
   ```bash
   git add .
   git commit -m "feat: add Airbnb rate fetcher (TDD Red phase)"
   git commit -m "feat: implement basic rate fetching (TDD Green phase)"
   git commit -m "refactor: improve error handling (TDD Refactor phase)"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR via GitHub UI
   ```

5. **Code Review**
   - Ensure TDD process was followed
   - Check test coverage
   - Verify code quality
   - Approve and merge

## Pre-commit Hooks

We use pre-commit hooks to enforce TDD practices:

```bash
# Install the pre-commit hook
git config core.hooksPath .githooks
```

The hook will:
- Check that test files exist for source changes
- Run tests to ensure they pass
- Prevent commits if TDD process is violated

## Testing Strategy

### Unit Tests
- **Shared Library**: Vitest + TypeScript
- **Universal Snippet**: Vitest + TypeScript
- **WordPress Plugin**: PHPUnit + WordPress test environment

### Integration Tests
- **API Integration**: Test external service interactions
- **Database Integration**: Test WordPress database operations
- **Cross-browser**: Playwright for universal snippet

### E2E Tests
- **Complete User Workflows**: Full rate comparison flow
- **Configuration Management**: Admin panel functionality
- **WordPress Integration**: Plugin activation and usage

## Code Quality Standards

### JavaScript/TypeScript
- ESLint configuration enforced
- TypeScript strict mode
- 80%+ test coverage required
- No console.log in production code

### PHP (WordPress)
- WordPress Coding Standards (WPCS)
- PHPStan level 5 analysis
- 80%+ test coverage required
- Proper sanitization and escaping

## Commit Message Format

```
type(scope): description

feat(rate-fetcher): add Airbnb rate fetching with web scraping
fix(date-utils): handle timezone issues in date parsing
refactor(cache): improve cache invalidation logic
test(rate-data): add validation tests for rate data models
docs(api): update API documentation for rate fetching
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `style`: Code style changes
- `perf`: Performance improvements
- `chore`: Maintenance tasks

## PR Requirements

### Before Creating PR
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] TDD process was followed
- [ ] Test coverage maintained
- [ ] No breaking changes (or documented)

### PR Template Checklist
- [ ] Red Phase: Failing tests written first
- [ ] Green Phase: Minimal code to pass tests
- [ ] Refactor Phase: Code improved while keeping tests green
- [ ] All functionality covered by tests
- [ ] Code quality checks pass
- [ ] Documentation updated

## Continuous Integration

Our CI pipeline enforces:
- TDD process validation
- Test coverage thresholds (80%+)
- Code quality checks
- Security scanning
- Performance benchmarks

## Troubleshooting

### Common TDD Issues

1. **"No test files found" error**
   - Ensure you have test files for your source changes
   - Follow naming convention: `*.test.js`, `*.spec.ts`, `*Test.php`

2. **Tests failing in CI but passing locally**
   - Check environment differences
   - Ensure all dependencies are installed
   - Verify test data is consistent

3. **Coverage below threshold**
   - Add more test cases
   - Check for untested code paths
   - Consider if code is necessary

### Getting Help

- Check existing issues and PRs
- Review the TDD workflow documentation
- Ask in team discussions
- Create an issue with detailed information

## Best Practices

1. **Start Small**: Begin with the simplest test case
2. **One Thing at a Time**: Focus on one feature or bug at a time
3. **Clear Test Names**: Use descriptive test names that explain the behavior
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Mock External Dependencies**: Isolate units under test
6. **Refactor Regularly**: Keep code clean and maintainable
7. **Document Complex Logic**: Add comments for non-obvious code
8. **Review Your Own Code**: Self-review before creating PR

Remember: **TDD is not just about testing - it's about design and confidence in your code.**

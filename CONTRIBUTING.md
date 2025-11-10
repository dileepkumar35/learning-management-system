# Contributing to Learning Management System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see README.md)
4. Create a new branch for your feature or bugfix

## Development Workflow

### Branch Naming

- Feature: `feature/your-feature-name`
- Bugfix: `bugfix/issue-description`
- Hotfix: `hotfix/issue-description`

### Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Ensure all tests pass
4. Update documentation if needed
5. Commit your changes with clear, descriptive commit messages

### Commit Message Format

Use conventional commit messages:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(courses): add course search functionality

Implemented full-text search for courses with filters
for instructor, level, and category.

Closes #123
```

## Code Style

### Backend (JavaScript/Node.js)

- Use 2 spaces for indentation
- Use semicolons
- Use const/let, avoid var
- Use async/await over callbacks
- Add JSDoc comments for complex functions

### Frontend (React)

- Use functional components with hooks
- Use 2 spaces for indentation
- Follow Airbnb React style guide
- Use PropTypes or TypeScript for type checking
- Keep components small and focused

## Testing

### Backend Tests

Run tests before submitting:
```bash
cd backend
npm test
```

Add tests for:
- All new endpoints
- Bug fixes
- Business logic functions

### Frontend Tests

When adding frontend tests (future):
```bash
cd frontend
npm test
```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the API_DOCUMENTATION.md if API changes are made
3. Ensure all tests pass
4. Update the CHANGELOG.md (if exists)
5. Request review from maintainers

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] PR description clearly explains the changes

## Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, etc.
6. **Screenshots**: If applicable

## Feature Requests

When suggesting features, include:

1. **Use Case**: Why is this feature needed?
2. **Description**: Detailed description of the feature
3. **Proposed Solution**: How you think it should be implemented
4. **Alternatives**: Other solutions you've considered

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct that could be considered inappropriate

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Contact the maintainers

Thank you for contributing! 🎉

# Testing Instructions

## Prerequisites
- Node.js 18+
- MongoDB 5.0+ (Docker or local)

## Setup & Run Tests

### 1. Start MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 mongo:7

# Or use local MongoDB if installed
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test auth.test.js

# Watch mode (auto-rerun on changes)
npm test -- --watch
```

## Test Files
- `tests/auth.test.js` - Authentication tests (register, login, profile)
- `tests/courses.test.js` - Course management tests
- `tests/enrollment.test.js` - Student enrollment tests

## Expected Output
```
PASS  tests/auth.test.js
PASS  tests/courses.test.js
PASS  tests/enrollment.test.js

Tests: 15 passed, 15 total
Time: ~7-8 seconds
```

## Environment Setup
Create `.env` in backend folder:
```
MONGODB_URI=mongodb://localhost:27017/lms
MONGODB_URI_TEST=mongodb://localhost:27017/lms_test
JWT_SECRET=your-secret-key
```

## Troubleshooting
- **MongoDB error?** Start Docker container: `docker run -d -p 27017:27017 mongo:7`
- **Dependencies missing?** Run: `npm install`
- **Port in use?** Kill process or use: `docker run -d -p 27018:27017 mongo:7` (update MONGODB_URI)

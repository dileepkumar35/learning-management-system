# Learning Management System (LMS)

A full-stack Learning Management System built with modern web technologies.

## Tech Stack

### Frontend
- **Vite + React** - Fast build tool and modern React framework
- **Material UI** - Component library for polished UI
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB + Mongoose** - Database and ODM
- **JWT + bcrypt** - Authentication and password security
- **Express Validator** - Request validation

### Containerization
- **Docker + Docker Compose** - Container orchestration

## Features

### Authentication & Authorization
- Email/password authentication with secure password storage (bcrypt)
- JWT-based authentication
- Role-based access control (Student, Instructor, Admin)

### Course Management (Instructor)
- Create, read, update, and delete courses
- Organize courses into modules
- Create lessons with title, description, content (Markdown), video URL, and file references
- Order lessons within modules
- Publish/unpublish courses

### Student Features
- Browse and enroll in published courses
- View course content (modules and lessons)
- Mark lessons as complete
- Take auto-graded MCQ quizzes
- View personal dashboard with:
  - Enrolled courses
  - Progress per course (lessons completed / total)
  - Recent quiz scores
  - Suggested next lesson

### Quiz System
- Instructors can create MCQ quizzes for lessons
- Auto-grading with immediate feedback
- Score tracking with timestamps
- Passing score configuration

### Progress Tracking
- Lesson completion tracking
- Course progress calculation
- Timestamp recording for completions
- Dashboard with progress visualization

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & validation middleware
│   │   └── index.js         # Server entry point
│   ├── tests/               # Unit & integration tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main app component
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (for local development)

### Quick Start with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd learning-management-system
```

2. Start all services with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Development Mode with Docker (Hot Reload)

For development with hot reload:

1. Start services in development mode:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will enable hot reload for both frontend and backend, so changes are reflected immediately without rebuilding containers.

### Local Development Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

## Testing

### Backend Tests

The backend includes unit and integration tests for core functionality.

#### Run all tests:
```bash
cd backend
npm test
```

#### Run tests with coverage:
```bash
npm test -- --coverage
```

#### Run specific test file:
```bash
npm test -- auth.test.js
```

**Note**: Tests require MongoDB to be running. You can either:
- Use a local MongoDB instance
- Start MongoDB with Docker: `docker run -d -p 27017:27017 mongo:7`
- Set `MONGODB_URI_TEST` environment variable to point to your test database

### Manual Testing

You can test the API endpoints using:
- **Postman** or **Insomnia** - Import the API endpoints
- **curl** - Use command line
- **Frontend** - Use the React application

Example curl commands:
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get courses (save token from login)
curl http://localhost:5000/api/courses
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student"  // or "instructor"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": { ... }
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student"
}
```

### Course Endpoints

#### Get All Courses
```http
GET /api/courses

Response: 200 OK
[
  {
    "_id": "course-id",
    "title": "Introduction to Programming",
    "description": "Learn the basics of programming",
    "instructor": {
      "_id": "instructor-id",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "modules": [...],
    "isPublished": true
  }
]
```

#### Get Course by ID
```http
GET /api/courses/:id

Response: 200 OK
{
  "_id": "course-id",
  "title": "Introduction to Programming",
  "modules": [
    {
      "_id": "module-id",
      "title": "Module 1",
      "lessons": [
        {
          "_id": "lesson-id",
          "title": "Lesson 1",
          "content": "...",
          "quiz": "quiz-id"
        }
      ]
    }
  ]
}
```

#### Create Course (Instructor Only)
```http
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Course",
  "description": "Course description",
  "isPublished": false
}

Response: 201 Created
```

#### Update Course (Instructor Only)
```http
PUT /api/courses/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "isPublished": true
}

Response: 200 OK
```

### Module Endpoints

#### Create Module
```http
POST /api/courses/:courseId/modules
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Module 1",
  "description": "Module description",
  "order": 0
}

Response: 201 Created
```

### Lesson Endpoints

#### Create Lesson
```http
POST /api/courses/modules/:moduleId/lessons
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Lesson 1",
  "description": "Lesson description",
  "content": "Lesson content in Markdown",
  "videoUrl": "https://example.com/video",
  "order": 0
}

Response: 201 Created
```

#### Get Lesson
```http
GET /api/courses/lessons/:lessonId
Authorization: Bearer {token}

Response: 200 OK
```

### Enrollment Endpoints

#### Enroll in Course
```http
POST /api/enrollments
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course-id"
}

Response: 201 Created
```

#### Get My Enrollments
```http
GET /api/enrollments/my-enrollments
Authorization: Bearer {token}

Response: 200 OK
```

### Progress Endpoints

#### Mark Lesson Complete
```http
POST /api/progress/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "lessonId": "lesson-id",
  "courseId": "course-id"
}

Response: 200 OK
```

#### Get Course Progress
```http
GET /api/progress/course/:courseId
Authorization: Bearer {token}

Response: 200 OK
{
  "courseId": "course-id",
  "totalLessons": 10,
  "completedLessons": 5,
  "progressPercentage": 50,
  "recentQuizzes": [...],
  "suggestedLesson": {...}
}
```

#### Get Dashboard
```http
GET /api/progress/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "courses": [...],
  "recentQuizzes": [...]
}
```

### Quiz Endpoints

#### Create Quiz (Instructor Only)
```http
POST /api/quizzes
Authorization: Bearer {token}
Content-Type: application/json

{
  "lessonId": "lesson-id",
  "title": "Quiz 1",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ],
  "passingScore": 70
}

Response: 201 Created
```

#### Get Quiz
```http
GET /api/quizzes/:quizId
Authorization: Bearer {token}

Response: 200 OK
```

#### Submit Quiz
```http
POST /api/quizzes/:quizId/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [
    {
      "questionIndex": 0,
      "selectedAnswer": 1
    }
  ]
}

Response: 200 OK
{
  "score": 100,
  "passed": true,
  "correctAnswers": 1,
  "totalQuestions": 1
}
```

## Testing

### Backend Tests

Run backend tests:
```bash
cd backend
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Database Schema

### User
- email: String (unique)
- password: String (hashed)
- name: String
- role: String (student/instructor/admin)
- createdAt: Date

### Course
- title: String
- description: String
- instructor: ObjectId (ref: User)
- modules: [ObjectId] (ref: Module)
- thumbnail: String
- isPublished: Boolean
- createdAt/updatedAt: Date

### Module
- title: String
- description: String
- course: ObjectId (ref: Course)
- lessons: [ObjectId] (ref: Lesson)
- order: Number

### Lesson
- title: String
- description: String
- content: String (Markdown)
- videoUrl: String
- fileReference: String
- module: ObjectId (ref: Module)
- order: Number
- quiz: ObjectId (ref: Quiz)

### Quiz
- title: String
- lesson: ObjectId (ref: Lesson)
- questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }]
- passingScore: Number

### Enrollment
- student: ObjectId (ref: User)
- course: ObjectId (ref: Course)
- enrolledAt: Date
- status: String (active/completed/dropped)

### Progress
- student: ObjectId (ref: User)
- course: ObjectId (ref: Course)
- lesson: ObjectId (ref: Lesson)
- completed: Boolean
- completedAt: Date

### QuizAttempt
- student: ObjectId (ref: User)
- quiz: ObjectId (ref: Quiz)
- lesson: ObjectId (ref: Lesson)
- answers: Array
- score: Number
- passed: Boolean
- attemptedAt: Date

## Design Decisions

### Architecture
- **Monorepo Structure**: Backend and frontend in separate directories for clear separation of concerns
- **RESTful API**: Clean, predictable API design following REST principles
- **JWT Authentication**: Stateless authentication for scalability
- **Role-Based Access Control**: Middleware-based authorization for secure endpoints

### Database
- **MongoDB**: Chosen for flexibility with document-based data and easy scaling
- **Mongoose ODM**: Provides schema validation and clean data modeling
- **Indexed Fields**: Unique indexes on critical fields (email, enrollment pairs)

### Frontend
- **React with Hooks**: Modern functional components with hooks for state management
- **Context API**: Global authentication state without heavy state management libraries
- **Material UI**: Professional, accessible UI components out of the box
- **Axios Interceptors**: Automatic token injection for authenticated requests

### Security
- **bcrypt**: Industry-standard password hashing
- **JWT Tokens**: Secure, stateless authentication
- **Input Validation**: Server-side validation on all inputs
- **CORS**: Configured for security in production

## Known Limitations

1. **File Upload**: Currently only supports file references (URLs), not actual file uploads
2. **Video Hosting**: No built-in video hosting, requires external URLs
3. **Search**: No search functionality implemented
4. **Notifications**: No real-time notifications for students
5. **Analytics**: Limited analytics and reporting features
6. **Mobile App**: Web-only, no native mobile apps
7. **Real-time Features**: No WebSocket support for live updates
8. **Email Verification**: No email verification on registration
9. **Password Reset**: No password reset functionality
10. **Course Categories**: No course categorization or tags

## Future Enhancements

- File upload support for course materials
- Video player integration
- Real-time notifications
- Advanced analytics dashboard
- Course search and filtering
- Discussion forums
- Live video classes
- Certificate generation
- Payment integration
- Mobile apps
- Email notifications
- Social login integration

## Security Considerations

### Current Implementation
- Passwords are securely hashed with bcrypt
- JWT tokens for stateless authentication
- Input validation on all endpoints
- Role-based access control

### Production Recommendations
1. **Rate Limiting**: Implement rate limiting (e.g., express-rate-limit) to prevent abuse
2. **Input Sanitization**: Add additional input sanitization for NoSQL injection prevention
3. **HTTPS**: Use HTTPS in production
4. **Environment Variables**: Use secure secret management (e.g., AWS Secrets Manager, HashiCorp Vault)
5. **CORS**: Configure CORS properly for your production domain
6. **Helmet.js**: Add security headers
7. **MongoDB Security**: Enable authentication on MongoDB in production
8. **API Gateway**: Consider using an API gateway for additional security layers

### Known Security Notes
- CodeQL may report SQL injection warnings for MongoDB queries - these are false positives as Mongoose provides NoSQL injection protection
- Rate limiting is not implemented - should be added before production deployment
- CORS is currently permissive for development - restrict in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Response Format
All responses are in JSON format.

Success responses follow this structure:
```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error responses follow this structure:
```json
{
  "error": "Error message"
}
```

## Authentication Details
- JWT tokens expire in 7 days
- Tokens must be included in the `Authorization` header as: `Bearer <token>`
- User roles: `student` (default) or `instructor`
- Password must be at least 6 characters

## Endpoints

### Authentication

#### Register
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### Login
Authenticate a user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### Get Profile
Get current user profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student"
}
```

---

### Courses

#### Get All Courses
Get all published courses.

**Endpoint:** `GET /api/courses`

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Programming",
    "description": "Learn the basics of programming",
    "instructor": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "modules": [],
    "isPublished": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Course by ID
Get a specific course with modules and lessons.

**Endpoint:** `GET /api/courses/:id`

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "instructor": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith"
  },
  "modules": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Getting Started",
      "lessons": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "title": "Introduction",
          "content": "Welcome to the course...",
          "order": 0
        }
      ],
      "order": 0
    }
  ]
}
```

#### Create Course
Create a new course (Instructor only).

**Endpoint:** `POST /api/courses`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "thumbnail": "https://example.com/image.jpg",
  "isPublished": false
}
```

**Response:** `201 Created`
```json
{
  "message": "Course created successfully",
  "course": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "New Course",
    "description": "Course description",
    "instructor": "507f1f77bcf86cd799439012"
  }
}
```

#### Update Course
Update a course (Instructor only, must be course owner).

**Endpoint:** `PUT /api/courses/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "isPublished": true
}
```

**Response:** `200 OK`

#### Delete Course
Delete a course (Instructor only, must be course owner).

**Endpoint:** `DELETE /api/courses/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Course deleted successfully"
}
```

---

### Modules

#### Create Module
Add a module to a course.

**Endpoint:** `POST /api/courses/:courseId/modules`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Module 1",
  "description": "Module description",
  "order": 0
}
```

**Response:** `201 Created`
```json
{
  "message": "Module created successfully",
  "module": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Module 1",
    "description": "Module description",
    "course": "507f1f77bcf86cd799439011",
    "order": 0,
    "lessons": []
  }
}
```

#### Update Module
Update a module.

**Endpoint:** `PUT /api/courses/modules/:moduleId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Module Title",
  "description": "Updated description",
  "order": 1
}
```

**Response:** `200 OK`
```json
{
  "message": "Module updated successfully",
  "module": { ... }
}
```

#### Delete Module
Delete a module (also deletes all associated lessons).

**Endpoint:** `DELETE /api/courses/modules/:moduleId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Module deleted successfully"
}
```

---

### Lessons

#### Create Lesson
Add a lesson to a module.

**Endpoint:** `POST /api/courses/modules/:moduleId/lessons`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Lesson 1",
  "description": "Lesson description",
  "content": "Lesson content in Markdown format...",
  "videoUrl": "https://example.com/video.mp4",
  "fileReference": "https://example.com/file.pdf",
  "order": 0
}
```

**Response:** `201 Created`
```json
{
  "message": "Lesson created successfully",
  "lesson": {
    "_id": "507f1f77bcf86cd799439021",
    "title": "Lesson 1",
    "description": "Lesson description",
    "content": "Lesson content...",
    "videoUrl": "https://example.com/video.mp4",
    "fileReference": "https://example.com/file.pdf",
    "module": "507f1f77bcf86cd799439020",
    "order": 0,
    "quiz": null
  }
}
```

#### Get Lesson
Get a specific lesson (user must be enrolled or instructor).

**Endpoint:** `GET /api/courses/lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "title": "Lesson 1",
  "description": "Lesson description",
  "content": "Lesson content...",
  "videoUrl": "https://example.com/video.mp4",
  "fileReference": "https://example.com/file.pdf",
  "module": { ... },
  "quiz": { ... }
}
```

#### Update Lesson
Update a lesson.

**Endpoint:** `PUT /api/courses/lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Lesson Title",
  "description": "Updated description",
  "content": "Updated content...",
  "videoUrl": "https://example.com/new-video.mp4",
  "fileReference": "https://example.com/new-file.pdf",
  "order": 0
}
```

**Response:** `200 OK`
```json
{
  "message": "Lesson updated successfully",
  "lesson": { ... }
}
```

#### Delete Lesson
Delete a lesson (also deletes associated quiz if exists).

**Endpoint:** `DELETE /api/courses/lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Lesson deleted successfully"
}
```

---

### Enrollments

#### Enroll in Course
Enroll the current user in a course.

**Endpoint:** `POST /api/enrollments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011"
}
```

**Response:** `201 Created`
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "_id": "507f1f77bcf86cd799439015",
    "student": "507f1f77bcf86cd799439011",
    "course": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Programming"
    },
    "enrolledAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get My Enrollments
Get all enrollments for the current user.

**Endpoint:** `GET /api/enrollments/my-enrollments`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "course": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "instructor": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "modules": [
        {
          "_id": "507f1f77bcf86cd799439020",
          "title": "Getting Started",
          "lessons": []
        }
      ]
    },
    "enrolledAt": "2024-01-01T00:00:00.000Z",
    "status": "active"
  }
]
```

#### Check Enrollment
Check if the user is enrolled in a specific course.

**Endpoint:** `GET /api/enrollments/check/:courseId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "enrolled": true,
  "enrollment": {
    "_id": "507f1f77bcf86cd799439015",
    "enrolledAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Unenroll from Course
Unenroll from a course.

**Endpoint:** `DELETE /api/enrollments/:courseId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Progress

#### Mark Lesson Complete
Mark a lesson as completed.

**Endpoint:** `POST /api/progress/complete`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "lessonId": "507f1f77bcf86cd799439014",
  "courseId": "507f1f77bcf86cd799439011"
}
```

**Response:** `200 OK`
```json
{
  "message": "Lesson marked as complete",
  "progress": {
    "_id": "507f1f77bcf86cd799439016",
    "student": "507f1f77bcf86cd799439011",
    "lesson": "507f1f77bcf86cd799439014",
    "completed": true,
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Course Progress
Get progress for a specific course.

**Endpoint:** `GET /api/progress/course/:courseId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "totalLessons": 10,
  "completedLessons": 5,
  "progressPercentage": 50,
  "recentQuizzes": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "score": 85,
      "passed": true,
      "attemptedAt": "2024-01-10T14:00:00.000Z",
      "quiz": {
        "_id": "507f1f77bcf86cd799439017",
        "title": "Module 1 Quiz"
      },
      "lesson": {
        "_id": "507f1f77bcf86cd799439014",
        "title": "Lesson 1"
      }
    }
  ],
  "suggestedLesson": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Next Lesson"
  },
  "progressRecords": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "student": "507f1f77bcf86cd799439011",
      "lesson": "507f1f77bcf86cd799439014",
      "completed": true,
      "completedAt": "2024-01-09T10:00:00.000Z"
    }
  ]
}
```

#### Get Dashboard
Get student dashboard with all courses and progress.

**Endpoint:** `GET /api/progress/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "courses": [
    {
      "courseId": "507f1f77bcf86cd799439011",
      "courseTitle": "Introduction to Programming",
      "totalLessons": 10,
      "completedLessons": 5,
      "progressPercentage": 50,
      "recentQuiz": {
        "_id": "507f1f77bcf86cd799439040",
        "score": 85,
        "passed": true
      },
      "suggestedLesson": {
        "_id": "507f1f77bcf86cd799439015",
        "title": "Next Lesson"
      },
      "enrolledAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "recentQuizzes": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "score": 85,
      "passed": true,
      "attemptedAt": "2024-01-10T14:00:00.000Z"
    }
  ]
}
```

---

### Health Check

#### System Health Status
Check if the API is running and connected to database.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "message": "LMS API is running"
}
```

---

### Quizzes

#### Create Quiz
Create a quiz for a lesson (Instructor only).

**Endpoint:** `POST /api/quizzes`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "lessonId": "507f1f77bcf86cd799439014",
  "title": "Lesson 1 Quiz",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    },
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2
    }
  ],
  "passingScore": 70
}
```

**Response:** `201 Created`

#### Get Quiz
Get a quiz (students see questions without correct answers).

**Endpoint:** `GET /api/quizzes/:quizId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "title": "Lesson 1 Quiz",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"]
    }
  ],
  "passingScore": 70
}
```

#### Submit Quiz
Submit quiz answers for grading.

**Endpoint:** `POST /api/quizzes/:quizId/submit`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionIndex": 0,
      "selectedAnswer": 1
    },
    {
      "questionIndex": 1,
      "selectedAnswer": 2
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Quiz submitted successfully",
  "score": 100,
  "passed": true,
  "correctAnswers": 2,
  "totalQuestions": 2,
  "passingScore": 70,
  "attempt": {
    "id": "507f1f77bcf86cd799439018",
    "attemptedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Quiz Attempts
Get all attempts for a quiz (student's own attempts).

**Endpoint:** `GET /api/quizzes/:quizId/attempts`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "student": "507f1f77bcf86cd799439011",
    "quiz": "507f1f77bcf86cd799439017",
    "lesson": "507f1f77bcf86cd799439014",
    "score": 100,
    "passed": true,
    "attemptedAt": "2024-01-01T00:00:00.000Z",
    "answers": [
      {
        "questionIndex": 0,
        "selectedAnswer": 1
      }
    ]
  }
]
```

#### Update Quiz
Update a quiz (Instructor only, must be quiz owner).

**Endpoint:** `PUT /api/quizzes/:quizId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ],
  "passingScore": 80
}
```

**Response:** `200 OK`
```json
{
  "message": "Quiz updated successfully",
  "quiz": { ... }
}
```

#### Delete Quiz
Delete a quiz (Instructor only, must be quiz owner).

**Endpoint:** `DELETE /api/quizzes/:quizId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Quiz deleted successfully"
}
```

---

### Certificates

#### Issue Certificate
Issue a certificate for a completed course (must complete all lessons).

**Endpoint:** `POST /api/certificates/issue`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011"
}
```

**Response:** `201 Created`
```json
{
  "message": "Certificate issued successfully",
  "certificate": {
    "_id": "507f1f77bcf86cd799439025",
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "course": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Programming"
    },
    "certificateId": "CERT-1abc123-def456",
    "verificationCode": "ABC123DEF456789",
    "completionDate": "2024-01-15T10:30:00.000Z",
    "issuedAt": "2024-01-15T10:35:00.000Z",
    "grade": 85
  }
}
```

#### Get My Certificates
Get all certificates for the current student.

**Endpoint:** `GET /api/certificates/my-certificates`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439025",
    "course": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Programming"
    },
    "certificateId": "CERT-1abc123-def456",
    "grade": 85,
    "issuedAt": "2024-01-15T10:35:00.000Z"
  }
]
```

#### Download Certificate PDF
Download certificate as PDF file.

**Endpoint:** `GET /api/certificates/download/:certificateId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK` (PDF file)

#### Get Certificate Details
Get public certificate details by certificate ID (no authentication required).

**Endpoint:** `GET /api/certificates/:certificateId`

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439025",
  "student": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "course": {
    "title": "Introduction to Programming"
  },
  "certificateId": "CERT-1abc123-def456",
  "completionDate": "2024-01-15T10:30:00.000Z",
  "issuedAt": "2024-01-15T10:35:00.000Z",
  "grade": 85
}
```

#### Verify Certificate
Verify a certificate using verification code.

**Endpoint:** `POST /api/certificates/verify`

**Request Body:**
```json
{
  "verificationCode": "ABC123DEF456789"
}
```

**Response:** `200 OK`
```json
{
  "verified": true,
  "certificate": { ... }
}
```

#### Check Certificate Eligibility
Check if student is eligible to receive a certificate for a course.

**Endpoint:** `GET /api/certificates/check/:courseId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "eligible": true,
  "completed": true,
  "grade": 85,
  "error": null
}
```

#### Get My Courses
Get all courses created by the instructor with statistics.

**Endpoint:** `GET /api/instructor/my-courses`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Programming",
    "description": "Learn the basics...",
    "isPublished": true,
    "modules": [],
    "stats": {
      "totalEnrollments": 45,
      "activeEnrollments": 35,
      "completedEnrollments": 10,
      "totalLessons": 12
    }
  }
]
```

#### Get Enrolled Students
Get all students enrolled in a specific course with their progress.

**Endpoint:** `GET /api/instructor/courses/:courseId/students`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "course": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Programming",
    "description": "Learn the basics..."
  },
  "students": [
    {
      "enrollmentId": "507f1f77bcf86cd799439030",
      "student": {
        "id": "507f1f77bcf86cd799439001",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "enrolledAt": "2024-01-01T00:00:00.000Z",
      "status": "active",
      "progress": {
        "totalLessons": 12,
        "completedLessons": 6,
        "progressPercentage": 50,
        "totalQuizAttempts": 3,
        "avgQuizScore": 85,
        "lastAccessed": "2024-01-10T15:30:00.000Z"
      }
    }
  ]
}
```

#### Get Student Progress Details
Get detailed progress of a specific student in a course.

**Endpoint:** `GET /api/instructor/courses/:courseId/students/:studentId/progress`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "student": {
    "id": "507f1f77bcf86cd799439001",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "course": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Programming"
  },
  "enrollment": {
    "enrolledAt": "2024-01-01T00:00:00.000Z",
    "status": "active"
  },
  "summary": {
    "totalLessons": 12,
    "completedLessons": 6,
    "overallProgress": 50,
    "totalQuizAttempts": 3,
    "avgQuizScore": 85
  },
  "modules": [
    {
      "moduleId": "507f1f77bcf86cd799439020",
      "title": "Getting Started",
      "totalLessons": 3,
      "completedLessons": 2,
      "progressPercentage": 67,
      "lessons": [
        {
          "lessonId": "507f1f77bcf86cd799439021",
          "title": "Introduction",
          "completed": true,
          "completedAt": "2024-01-05T10:00:00.000Z",
          "hasQuiz": true,
          "quizAttempts": [
            {
              "attemptId": "507f1f77bcf86cd799439040",
              "score": 85,
              "passed": true,
              "attemptedAt": "2024-01-05T10:15:00.000Z",
              "totalQuestions": 5
            }
          ]
        }
      ]
    }
  ]
}
```

#### Get Dashboard Statistics
Get overall instructor dashboard statistics.

**Endpoint:** `GET /api/instructor/dashboard/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "totalCourses": 5,
  "publishedCourses": 3,
  "totalEnrollments": 125,
  "activeEnrollments": 95,
  "completedEnrollments": 30,
  "totalLessons": 45,
  "totalQuizzes": 20,
  "recentEnrollments": 8
}
```

---

## Error Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

## Pagination

Currently, pagination is not implemented for list endpoints. All results are returned in a single response. For production, implement pagination for better performance.

## Input Validation

- Email addresses must be valid format
- Passwords must be at least 6 characters
- Course titles and lesson titles cannot be empty
- Quiz questions must have at least 2 options
- Question correct answer index must be within the options range
- Quiz passing score should be between 0-100

## Authorization Notes

- **Public Endpoints**: `/api/courses` (GET), `/api/certificates/:certificateId` (GET), `/api/certificates/verify` (POST), `/health`
- **Student Endpoints**: All `/api/progress/*`, `/api/enrollments/*`, quiz submission, progress tracking
- **Instructor Endpoints**: Course/module/lesson creation & management, quiz creation, `/api/instructor/*`
- **Authenticated Endpoints**: Most endpoints require a valid JWT token in the Authorization header

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "name": "User Name",
  "role": "student|instructor",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Course
```json
{
  "_id": "ObjectId",
  "title": "Course Title",
  "description": "Description",
  "instructor": "ObjectId(User)",
  "modules": ["ObjectId(Module)"],
  "thumbnail": "URL",
  "isPublished": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Module
```json
{
  "_id": "ObjectId",
  "title": "Module Title",
  "description": "Description",
  "course": "ObjectId(Course)",
  "lessons": ["ObjectId(Lesson)"],
  "order": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Lesson
```json
{
  "_id": "ObjectId",
  "title": "Lesson Title",
  "description": "Description",
  "content": "Markdown content",
  "module": "ObjectId(Module)",
  "videoUrl": "URL",
  "fileReference": "URL",
  "quiz": "ObjectId(Quiz)",
  "order": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Enrollment
```json
{
  "_id": "ObjectId",
  "student": "ObjectId(User)",
  "course": "ObjectId(Course)",
  "status": "active|completed",
  "enrolledAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Progress
```json
{
  "_id": "ObjectId",
  "student": "ObjectId(User)",
  "course": "ObjectId(Course)",
  "lesson": "ObjectId(Lesson)",
  "completed": false,
  "completedAt": "ISO8601|null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Certificate
```json
{
  "_id": "ObjectId",
  "student": "ObjectId(User)",
  "course": "ObjectId(Course)",
  "certificateId": "CERT-xxxxx-xxxxx",
  "verificationCode": "UNIQUE_CODE",
  "completionDate": "ISO8601",
  "issuedAt": "ISO8601",
  "grade": 85,
  "digitalSignature": "signature_string",
  "verificationToken": "token_string"
}
```

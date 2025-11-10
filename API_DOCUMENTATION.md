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
  "order": 1
}
```

**Response:** `200 OK`

#### Delete Module
Delete a module.

**Endpoint:** `DELETE /api/courses/modules/:moduleId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

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

#### Get Lesson
Get a specific lesson.

**Endpoint:** `GET /api/courses/lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

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
  "content": "Updated content..."
}
```

**Response:** `200 OK`

#### Delete Lesson
Delete a lesson.

**Endpoint:** `DELETE /api/courses/lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

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
      "modules": []
    },
    "enrolledAt": "2024-01-01T00:00:00.000Z"
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
  "recentQuizzes": [],
  "suggestedLesson": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Next Lesson"
  },
  "progressRecords": []
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
      "recentQuiz": null,
      "suggestedLesson": {
        "_id": "507f1f77bcf86cd799439014",
        "title": "Next Lesson"
      }
    }
  ],
  "recentQuizzes": []
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
Get all attempts for a quiz.

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
    "score": 100,
    "passed": true,
    "attemptedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Update Quiz
Update a quiz (Instructor only).

**Endpoint:** `PUT /api/quizzes/:quizId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "passingScore": 80
}
```

**Response:** `200 OK`

#### Delete Quiz
Delete a quiz (Instructor only).

**Endpoint:** `DELETE /api/quizzes/:quizId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

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

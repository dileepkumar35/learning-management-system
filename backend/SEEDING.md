# Database Seeding Guide

This guide explains how to populate your LMS database with realistic dummy data using the `@faker-js/faker` package.

## Overview

The seed script creates:
- **3 instructors** and **30 students** (63 total users)
- **6 courses** (2 per instructor)
- **19 modules** across all courses
- **57 lessons** across all modules
- **26 quizzes** (approximately 50% of lessons)
- **57 enrollments** (students enrolled in random courses)
- **221 progress entries** (lesson completion tracking)
- **159 quiz attempts** (student quiz submissions)

All data is randomly generated using realistic names, emails, descriptions, and titles.

## Prerequisites

Ensure you have:
1. Node.js and npm installed
2. Dependencies installed: `npm install` (includes `@faker-js/faker` and `mongoose`)
3. A valid MongoDB URI in `backend/.env` (see below)

## MongoDB Configuration

Your `backend/.env` file must contain:
```
MONGODB_URI=mongodb+srv://user:password@cluster.s9ewqpf.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**⚠️ IMPORTANT: Do NOT use a production database for seeding.** Always test on a development or local MongoDB instance.

## Running the Seed Script

### Standard Run (Append to Existing Data)
```bash
cd backend
npm run seed
```

This will add dummy data to your existing database without dropping existing collections.

### Reset Database Before Seeding
To clear all data before seeding (useful for a fresh start):
```bash
cd backend
DROP_DATABASE=true npm run seed
```

### Manual Run
If needed, you can also run directly:
```bash
cd backend
node scripts/seed.js
```

## Expected Output

After running the seed, you should see:
```
Connecting to DB...
Connected.
Creating users...
Created 3 instructors and 30 students.
Creating courses/modules/lessons/quizzes...
Created 6 courses.
Enrolling students...
Created 57 enrollments.
Creating progress entries and quiz attempts...
Seeding complete.
Counts:
Users: 34, Courses: 6, Modules: 19, Lessons: 57, Quizzes: 26, Enrollments: 57, Progress: 221, QuizAttempts: 159
```

## Schema Details

### User
- **Name**: Faker-generated full name
- **Email**: Unique faker-generated email
- **Password**: `password123` (hashed with bcrypt)
- **Role**: Either `instructor` (3) or `student` (30)

### Course
- **Title**: Random 2–5 word phrase
- **Description**: Random paragraphs
- **Instructor**: Reference to an instructor user
- **Modules**: Array of module IDs
- **Thumbnail**: Faker-generated image URL
- **isPublished**: Always `true`

### Module
- **Title**: `Module X: [random words]`
- **Description**: Random sentence
- **Course**: Reference to parent course
- **Lessons**: Array of lesson IDs
- **Order**: Sequential (0, 1, 2, ...)

### Lesson
- **Title**: `Lesson X: [random words]`
- **Description**: Random sentence
- **Content**: Random 2 paragraph text
- **Module**: Reference to parent module
- **Quiz**: Reference to quiz (if applicable, ~50% of lessons)
- **Order**: Sequential

### Quiz
- **Title**: `[Course Title] - [Lesson Title] Quiz`
- **Lesson**: Reference to parent lesson
- **Questions**: 3–6 questions per quiz
  - Each question has 4 random sentence options
  - Correct answer is randomly selected
- **passingScore**: 70

### QuizAttempt
- **Student**: Reference to a student user
- **Quiz**: Reference to a quiz
- **Lesson**: Reference to the lesson containing the quiz
- **Answers**: Array of answer selections (60% chance to select correct answer)
- **Score**: Calculated percentage (0–100)
- **Passed**: Boolean based on `score >= quiz.passingScore`

### Enrollment
- **Student**: Reference to a student user
- **Course**: Reference to a course
- **Status**: Always `active`
- **enrolledAt**: Timestamp (creation date)

### Progress
- **Student**: Reference to a student
- **Course**: Reference to a course
- **Lesson**: Reference to a lesson
- **Completed**: Boolean (~70% true, ~30% false for marked lessons)
- **completedAt**: Timestamp if `completed: true`, otherwise `null`

## Troubleshooting

### Error: `MONGODB_URI not found in environment`
- Ensure `backend/.env` exists and contains `MONGODB_URI=...`
- Run the script from the `backend/` directory or use `npm run seed`

### Error: `connect ECONNREFUSED`
- MongoDB is not running or the URI is unreachable
- Check your MongoDB connection string in `.env`
- Ensure MongoDB Atlas cluster is active (or local MongoDB is running)

### Error: `E11000 duplicate key error`
- The script handles duplicates gracefully (e.g., unique emails, student-course pairs)
- If you see many E11000 errors, consider running with `DROP_DATABASE=true`

### Script Hangs or Times Out
- Your MongoDB connection may be slow
- Increase the timeout or check your network connectivity
- Consider running on a local MongoDB instance for faster development

## Cleanup

To remove all seeded data:
```bash
DROP_DATABASE=true npm run seed
# Then run without data to verify cleanup, or manually drop the database via MongoDB UI
```

Or drop the database manually via MongoDB Atlas or your local mongo client:
```bash
# In MongoDB shell
use lms
db.dropDatabase()
```

## Notes

- All passwords are hashed with bcryptjs before storage
- Emails are unique and lowercase
- Random data is generated fresh each run (no seeding of faker RNG by default)
- Relationships are maintained: lessons reference modules, modules reference courses, etc.
- The script disconnects from MongoDB when complete (no hanging connections)


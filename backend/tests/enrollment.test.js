const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');

describe('Enrollment Tests', () => {
  let instructorToken;
  let studentToken;
  let studentId;
  let courseId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/lms_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    // Create instructor and course
    const instructorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'instructor@example.com',
        password: 'password123',
        name: 'Instructor User',
        role: 'instructor'
      });
    instructorToken = instructorRes.body.token;

    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Test Course',
        description: 'Test Description',
        isPublished: true
      });
    courseId = courseRes.body.course._id;

    // Create student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@example.com',
        password: 'password123',
        name: 'Student User',
        role: 'student'
      });
    studentToken = studentRes.body.token;
    studentId = studentRes.body.user.id;
  });

  describe('POST /api/enrollments', () => {
    it('should allow student to enroll in a course', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: courseId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.enrollment.course).toBeDefined();
    });

    it('should not allow duplicate enrollment', async () => {
      // First enrollment
      await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: courseId
        });

      // Second enrollment attempt
      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: courseId
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/enrollments/my-enrollments', () => {
    it('should return student enrollments', async () => {
      // Enroll first
      await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: courseId
        });

      // Get enrollments
      const res = await request(app)
        .get('/api/enrollments/my-enrollments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });
});

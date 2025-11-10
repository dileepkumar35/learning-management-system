const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Course = require('../src/models/Course');

describe('Course Tests', () => {
  let instructorToken;
  let studentToken;
  let instructorId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/lms_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create instructor
    const instructorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'instructor@example.com',
        password: 'password123',
        name: 'Instructor User',
        role: 'instructor'
      });
    instructorToken = instructorRes.body.token;
    instructorId = instructorRes.body.user.id;

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
  });

  describe('POST /api/courses', () => {
    it('should allow instructor to create a course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.course.title).toBe('Test Course');
    });

    it('should not allow student to create a course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/courses', () => {
    it('should return published courses', async () => {
      // Create a published course
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Published Course',
          description: 'Test Description',
          isPublished: true
        });

      const res = await request(app).get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});

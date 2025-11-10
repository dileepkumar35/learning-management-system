const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { authenticate } = require('../middleware/auth');

// Enroll in a course
router.post('/', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ error: 'Course is not published' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.userId,
      course: courseId
    });

    await enrollment.save();
    await enrollment.populate('course', 'title description instructor');

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Error enrolling in course' });
  }
});

// Get all enrollments for the current user
router.get('/my-enrollments', authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.userId })
      .populate({
        path: 'course',
        populate: [
          { path: 'instructor', select: 'name email' },
          {
            path: 'modules',
            populate: { path: 'lessons' }
          }
        ]
      })
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Error fetching enrollments' });
  }
});

// Check if user is enrolled in a specific course
router.get('/check/:courseId', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: req.params.courseId
    });

    res.json({
      enrolled: !!enrollment,
      enrollment: enrollment || null
    });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    res.status(500).json({ error: 'Error checking enrollment' });
  }
});

// Unenroll from a course
router.delete('/:courseId', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      student: req.userId,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    res.status(500).json({ error: 'Error unenrolling from course' });
  }
});

module.exports = router;

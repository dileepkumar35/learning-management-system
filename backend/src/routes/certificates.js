const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// Generate a unique certificate ID
const generateCertificateId = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

// Generate a verification code
const generateVerificationCode = () => {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};

// Check if student has completed the course
const checkCourseCompletion = async (studentId, courseId) => {
  // Get all lessons in the course
  const course = await Course.findById(courseId).populate({
    path: 'modules',
    populate: { path: 'lessons' }
  });

  if (!course) {
    return { completed: false, error: 'Course not found' };
  }

  const lessonIds = [];
  course.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      lessonIds.push(lesson._id);
    });
  });

  if (lessonIds.length === 0) {
    return { completed: false, error: 'Course has no lessons' };
  }

  // Check if all lessons are completed
  const progressRecords = await Progress.find({
    student: studentId,
    lesson: { $in: lessonIds },
    completed: true
  });

  const completedLessons = progressRecords.length;
  const totalLessons = lessonIds.length;

  if (completedLessons < totalLessons) {
    return {
      completed: false,
      error: 'Course not fully completed',
      progress: { completedLessons, totalLessons }
    };
  }

  // Calculate grade based on quiz attempts
  const quizAttempts = await QuizAttempt.find({
    student: studentId,
    lesson: { $in: lessonIds }
  }).sort({ attemptedAt: -1 });

  // Get best score for each unique quiz
  const quizScores = new Map();
  quizAttempts.forEach(attempt => {
    const quizId = attempt.quiz.toString();
    if (!quizScores.has(quizId) || attempt.score > quizScores.get(quizId)) {
      quizScores.set(quizId, attempt.score);
    }
  });

  // Calculate average grade
  const scores = Array.from(quizScores.values());
  const averageGrade = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 100; // If no quizzes, perfect score

  return {
    completed: true,
    grade: averageGrade,
    completionDate: progressRecords.reduce((latest, record) => {
      return record.completedAt > latest ? record.completedAt : latest;
    }, progressRecords[0].completedAt)
  };
};

// Issue a certificate for a completed course
router.post('/issue', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: req.userId,
      course: courseId
    });

    if (existingCertificate) {
      return res.status(400).json({
        error: 'Certificate already issued',
        certificate: existingCertificate
      });
    }

    // Check course completion
    const completion = await checkCourseCompletion(req.userId, courseId);

    if (!completion.completed) {
      return res.status(400).json({
        error: completion.error,
        progress: completion.progress
      });
    }

    // Create certificate
    const certificate = new Certificate({
      student: req.userId,
      course: courseId,
      certificateId: generateCertificateId(),
      verificationCode: generateVerificationCode(),
      completionDate: completion.completionDate,
      grade: completion.grade
    });

    await certificate.save();

    // Update enrollment status to completed
    enrollment.status = 'completed';
    await enrollment.save();

    // Populate certificate data
    await certificate.populate('student', 'name email');
    await certificate.populate('course', 'title description');

    res.status(201).json({
      message: 'Certificate issued successfully',
      certificate
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ error: 'Error issuing certificate' });
  }
});

// Get all certificates for the authenticated student
router.get('/my-certificates', authenticate, async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.userId })
      .populate('course', 'title description')
      .populate('student', 'name email')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Error fetching certificates' });
  }
});

// Get a specific certificate by ID
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
      .populate('student', 'name email')
      .populate('course', 'title description');

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Error fetching certificate' });
  }
});

// Verify a certificate by verification code
router.post('/verify', async (req, res) => {
  try {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const certificate = await Certificate.findOne({
      verificationCode: verificationCode.toUpperCase()
    })
      .populate('student', 'name email')
      .populate('course', 'title description');

    if (!certificate) {
      return res.status(404).json({
        verified: false,
        error: 'Invalid verification code'
      });
    }

    res.json({
      verified: true,
      certificate
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ error: 'Error verifying certificate' });
  }
});

// Check if a course can be certified (eligibility check)
router.get('/check/:courseId', authenticate, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: req.userId,
      course: courseId
    });

    if (existingCertificate) {
      return res.json({
        eligible: false,
        alreadyIssued: true,
        certificate: existingCertificate
      });
    }

    // Check course completion
    const completion = await checkCourseCompletion(req.userId, courseId);

    res.json({
      eligible: completion.completed,
      completed: completion.completed,
      grade: completion.grade,
      progress: completion.progress,
      error: completion.error
    });
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    res.status(500).json({ error: 'Error checking certificate eligibility' });
  }
});

module.exports = router;

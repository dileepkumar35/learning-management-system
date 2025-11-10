const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const QuizAttempt = require('../models/QuizAttempt');
const { authenticate } = require('../middleware/auth');

// Mark a lesson as complete
router.post('/complete', authenticate, async (req, res) => {
  try {
    const { lessonId, courseId } = req.body;

    if (!lessonId || !courseId) {
      return res.status(400).json({ error: 'Lesson ID and Course ID are required' });
    }

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Find or create progress entry
    let progress = await Progress.findOne({
      student: req.userId,
      lesson: lessonId
    });

    if (progress) {
      if (!progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
        await progress.save();
      }
    } else {
      progress = new Progress({
        student: req.userId,
        course: courseId,
        lesson: lessonId,
        completed: true,
        completedAt: new Date()
      });
      await progress.save();
    }

    res.json({
      message: 'Lesson marked as complete',
      progress
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ error: 'Error marking lesson complete' });
  }
});

// Get progress for a specific course
router.get('/course/:courseId', authenticate, async (req, res) => {
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

    // Get course with all lessons
    const course = await Course.findById(courseId)
      .populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get all lesson IDs
    const lessonIds = [];
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        lessonIds.push(lesson._id);
      });
    });

    // Get progress for all lessons
    const progressRecords = await Progress.find({
      student: req.userId,
      lesson: { $in: lessonIds }
    });

    const completedLessons = progressRecords.filter(p => p.completed).length;
    const totalLessons = lessonIds.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Get recent quiz attempts
    const recentQuizzes = await QuizAttempt.find({
      student: req.userId,
      lesson: { $in: lessonIds }
    })
    .populate('quiz', 'title')
    .populate('lesson', 'title')
    .sort({ attemptedAt: -1 })
    .limit(5);

    // Find next suggested lesson
    let suggestedLesson = null;
    const progressMap = new Map(progressRecords.map(p => [p.lesson.toString(), p.completed]));
    
    outerLoop:
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!progressMap.get(lesson._id.toString())) {
          suggestedLesson = lesson;
          break outerLoop;
        }
      }
    }

    res.json({
      courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      recentQuizzes,
      suggestedLesson,
      progressRecords
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Error fetching course progress' });
  }
});

// Get overall student dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    // Get all enrollments
    const enrollments = await Enrollment.find({ student: req.userId })
      .populate({
        path: 'course',
        populate: {
          path: 'modules',
          populate: { path: 'lessons' }
        }
      });

    const dashboardData = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      
      // Get all lesson IDs
      const lessonIds = [];
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          lessonIds.push(lesson._id);
        });
      });

      // Get progress
      const progressRecords = await Progress.find({
        student: req.userId,
        lesson: { $in: lessonIds }
      });

      const completedLessons = progressRecords.filter(p => p.completed).length;
      const totalLessons = lessonIds.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Get recent quiz for this course
      const recentQuiz = await QuizAttempt.findOne({
        student: req.userId,
        lesson: { $in: lessonIds }
      })
      .populate('lesson', 'title')
      .sort({ attemptedAt: -1 });

      // Find next suggested lesson
      let suggestedLesson = null;
      const progressMap = new Map(progressRecords.map(p => [p.lesson.toString(), p.completed]));
      
      outerLoop:
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (!progressMap.get(lesson._id.toString())) {
            suggestedLesson = {
              _id: lesson._id,
              title: lesson.title
            };
            break outerLoop;
          }
        }
      }

      dashboardData.push({
        courseId: course._id,
        courseTitle: course.title,
        totalLessons,
        completedLessons,
        progressPercentage,
        recentQuiz,
        suggestedLesson,
        enrolledAt: enrollment.enrolledAt
      });
    }

    // Get recent quiz attempts across all courses
    const recentQuizzes = await QuizAttempt.find({
      student: req.userId
    })
    .populate('quiz', 'title')
    .populate('lesson', 'title')
    .sort({ attemptedAt: -1 })
    .limit(10);

    res.json({
      courses: dashboardData,
      recentQuizzes
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const { authenticate, isInstructor } = require('../middleware/auth');

// Create a quiz for a lesson (instructor only)
router.post('/', [
  authenticate,
  isInstructor,
  body('lessonId').notEmpty(),
  body('title').trim().notEmpty(),
  body('questions').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lessonId, title, questions, passingScore } = req.body;

    // Verify lesson exists and user is the instructor
    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (lesson.module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to create quiz for this lesson' });
    }

    // Check if quiz already exists for this lesson
    if (lesson.quiz) {
      return res.status(400).json({ error: 'Quiz already exists for this lesson' });
    }

    // Validate questions format
    for (const q of questions) {
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
        return res.status(400).json({ error: 'Invalid question format' });
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return res.status(400).json({ error: 'Invalid correct answer index' });
      }
    }

    const quiz = new Quiz({
      title,
      lesson: lessonId,
      questions,
      passingScore: passingScore || 70
    });

    await quiz.save();

    // Update lesson with quiz reference
    lesson.quiz = quiz._id;
    await lesson.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Error creating quiz' });
  }
});

// Get a quiz by ID (without correct answers for students)
router.get('/:quizId', authenticate, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('lesson');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if student is enrolled in the course
    const lesson = await Lesson.findById(quiz.lesson._id)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    const courseId = lesson.module.course._id;

    // For students, hide correct answers
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.userId,
        course: courseId
      });

      if (!enrollment) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }

      // Return quiz without correct answers
      const quizData = quiz.toObject();
      quizData.questions = quizData.questions.map(q => ({
        question: q.question,
        options: q.options,
        _id: q._id
      }));

      res.json(quizData);
    } else {
      // Instructors can see full quiz
      res.json(quiz);
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Error fetching quiz' });
  }
});

// Submit quiz attempt (student)
router.post('/:quizId/submit', [
  authenticate,
  body('answers').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quiz = await Quiz.findById(req.params.quizId).populate('lesson');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get course for enrollment check
    const lesson = await Lesson.findById(quiz.lesson._id)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    const courseId = lesson.module.course._id;

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const { answers } = req.body;

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && question.correctAnswer === answer.selectedAnswer) {
        correctAnswers++;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Save attempt
    const attempt = new QuizAttempt({
      student: req.userId,
      quiz: quiz._id,
      lesson: quiz.lesson._id,
      answers,
      score,
      passed
    });

    await attempt.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      passed,
      correctAnswers,
      totalQuestions,
      passingScore: quiz.passingScore,
      attempt: {
        id: attempt._id,
        attemptedAt: attempt.attemptedAt
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Error submitting quiz' });
  }
});

// Get quiz attempts for a specific quiz (student's own attempts)
router.get('/:quizId/attempts', authenticate, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      student: req.userId,
      quiz: req.params.quizId
    })
    .sort({ attemptedAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'Error fetching quiz attempts' });
  }
});

// Update quiz (instructor only)
router.put('/:quizId', [authenticate, isInstructor], async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate({
        path: 'lesson',
        populate: {
          path: 'module',
          populate: { path: 'course' }
        }
      });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.lesson.module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this quiz' });
    }

    const { title, questions, passingScore } = req.body;

    if (title) quiz.title = title;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    
    if (questions) {
      // Validate questions
      for (const q of questions) {
        if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
          return res.status(400).json({ error: 'Invalid question format' });
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          return res.status(400).json({ error: 'Invalid correct answer index' });
        }
      }
      quiz.questions = questions;
    }

    await quiz.save();

    res.json({
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Error updating quiz' });
  }
});

// Delete quiz (instructor only)
router.delete('/:quizId', [authenticate, isInstructor], async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate({
        path: 'lesson',
        populate: {
          path: 'module',
          populate: { path: 'course' }
        }
      });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.lesson.module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this quiz' });
    }

    // Remove quiz reference from lesson
    await Lesson.findByIdAndUpdate(quiz.lesson._id, { $unset: { quiz: 1 } });

    await Quiz.findByIdAndDelete(req.params.quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Error deleting quiz' });
  }
});

module.exports = router;

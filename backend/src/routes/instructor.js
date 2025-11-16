const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { authenticate, isInstructor } = require('../middleware/auth');

// Get all courses created by the instructor
router.get('/my-courses', [authenticate, isInstructor], async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.userId })
      .populate('instructor', 'name email')
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: {
          path: 'lessons',
          options: { sort: { order: 1 } }
        }
      })
      .sort({ createdAt: -1 });

    // Get enrollment counts for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
        const activeCount = await Enrollment.countDocuments({ course: course._id, status: 'active' });
        const completedCount = await Enrollment.countDocuments({ course: course._id, status: 'completed' });
        
        // Count total lessons
        const totalLessons = await Lesson.countDocuments({ 
          module: { $in: course.modules.map(m => m._id) } 
        });

        return {
          ...course.toObject(),
          stats: {
            totalEnrollments: enrollmentCount,
            activeEnrollments: activeCount,
            completedEnrollments: completedCount,
            totalLessons
          }
        };
      })
    );

    res.json(coursesWithStats);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get enrolled students for a specific course
router.get('/courses/:courseId/students', [authenticate, isInstructor], async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view students for this course' });
    }

    // Get all enrollments for this course with student details
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email')
      .sort({ enrolledAt: -1 });

    // Get detailed progress for each student
    const studentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.student._id;

        // Get all lessons in this course
        const modules = await Module.find({ course: req.params.courseId });
        const moduleIds = modules.map(m => m._id);
        const totalLessons = await Lesson.countDocuments({ module: { $in: moduleIds } });

        // Get completed lessons
        const completedProgress = await Progress.find({
          student: studentId,
          course: req.params.courseId,
          completed: true
        });
        const completedLessons = completedProgress.length;

        // Get quiz attempts
        const quizAttempts = await QuizAttempt.find({
          student: studentId
        }).populate({
          path: 'lesson',
          populate: {
            path: 'module',
            match: { course: req.params.courseId }
          }
        });

        // Filter quiz attempts that belong to this course
        const courseQuizAttempts = quizAttempts.filter(
          attempt => attempt.lesson && attempt.lesson.module && attempt.lesson.module.course
        );

        // Calculate average quiz score
        const avgQuizScore = courseQuizAttempts.length > 0
          ? Math.round(
              courseQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / courseQuizAttempts.length
            )
          : 0;

        // Calculate progress percentage
        const progressPercentage = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          enrollmentId: enrollment._id,
          student: {
            id: enrollment.student._id,
            name: enrollment.student.name,
            email: enrollment.student.email
          },
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: {
            totalLessons,
            completedLessons,
            progressPercentage,
            totalQuizAttempts: courseQuizAttempts.length,
            avgQuizScore,
            lastAccessed: completedProgress.length > 0
              ? completedProgress.sort((a, b) => b.completedAt - a.completedAt)[0].completedAt
              : enrollment.enrolledAt
          }
        };
      })
    );

    res.json({
      course: {
        id: course._id,
        title: course.title,
        description: course.description
      },
      students: studentsWithProgress
    });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ error: 'Error fetching enrolled students' });
  }
});

// Get detailed progress for a specific student in a course
router.get('/courses/:courseId/students/:studentId/progress', [authenticate, isInstructor], async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this information' });
    }

    // Get student details
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Student not enrolled in this course' });
    }

    // Get course structure with progress
    const modules = await Module.find({ course: courseId })
      .populate('lessons')
      .sort({ order: 1 });

    const moduleProgress = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({ module: module._id })
          .populate('quiz')
          .sort({ order: 1 });

        const lessonProgress = await Promise.all(
          lessons.map(async (lesson) => {
            const progress = await Progress.findOne({
              student: studentId,
              lesson: lesson._id
            });

            let quizAttempts = [];
            if (lesson.quiz) {
              quizAttempts = await QuizAttempt.find({
                student: studentId,
                quiz: lesson.quiz._id
              }).sort({ attemptedAt: -1 });
            }

            return {
              lessonId: lesson._id,
              title: lesson.title,
              description: lesson.description,
              order: lesson.order,
              completed: progress ? progress.completed : false,
              completedAt: progress ? progress.completedAt : null,
              hasQuiz: !!lesson.quiz,
              quizAttempts: quizAttempts.map(attempt => ({
                attemptId: attempt._id,
                score: attempt.score,
                passed: attempt.passed,
                attemptedAt: attempt.attemptedAt,
                totalQuestions: attempt.answers.length
              }))
            };
          })
        );

        const completedLessons = lessonProgress.filter(l => l.completed).length;
        const totalLessons = lessonProgress.length;

        return {
          moduleId: module._id,
          title: module.title,
          description: module.description,
          order: module.order,
          totalLessons,
          completedLessons,
          progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          lessons: lessonProgress
        };
      })
    );

    // Calculate overall stats
    const totalLessons = moduleProgress.reduce((sum, m) => sum + m.totalLessons, 0);
    const completedLessons = moduleProgress.reduce((sum, m) => sum + m.completedLessons, 0);
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Get all quiz attempts for this student in this course
    const allQuizAttempts = await QuizAttempt.find({
      student: studentId
    }).populate({
      path: 'lesson',
      populate: {
        path: 'module',
        match: { course: courseId }
      }
    });

    const courseQuizAttempts = allQuizAttempts.filter(
      attempt => attempt.lesson && attempt.lesson.module
    );

    const avgQuizScore = courseQuizAttempts.length > 0
      ? Math.round(
          courseQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / courseQuizAttempts.length
        )
      : 0;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      },
      course: {
        id: course._id,
        title: course.title,
        description: course.description
      },
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status
      },
      summary: {
        totalLessons,
        completedLessons,
        overallProgress,
        totalQuizAttempts: courseQuizAttempts.length,
        avgQuizScore
      },
      modules: moduleProgress
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Error fetching student progress' });
  }
});

// Get instructor dashboard stats
router.get('/dashboard/stats', [authenticate, isInstructor], async (req, res) => {
  try {
    // Get all courses by this instructor
    const courses = await Course.find({ instructor: req.userId });
    const courseIds = courses.map(c => c._id);

    // Get total enrollments across all courses
    const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });
    const activeEnrollments = await Enrollment.countDocuments({ 
      course: { $in: courseIds }, 
      status: 'active' 
    });
    const completedEnrollments = await Enrollment.countDocuments({ 
      course: { $in: courseIds }, 
      status: 'completed' 
    });

    // Get total lessons created
    const modules = await Module.find({ course: { $in: courseIds } });
    const moduleIds = modules.map(m => m._id);
    const totalLessons = await Lesson.countDocuments({ module: { $in: moduleIds } });

    // Get total quizzes created
    const totalQuizzes = await Quiz.countDocuments({
      lesson: { $in: await Lesson.find({ module: { $in: moduleIds } }).distinct('_id') }
    });

    // Get recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
      enrolledAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.isPublished).length,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalLessons,
      totalQuizzes,
      recentEnrollments
    });
  } catch (error) {
    console.error('Error fetching instructor dashboard stats:', error);
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

module.exports = router;

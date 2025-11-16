const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const { authenticate, isInstructor } = require('../middleware/auth');

// Get all published courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name email')
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons'
        }
      })
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get a single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: {
          path: 'lessons',
          options: { sort: { order: 1 } }
        }
      });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Error fetching course' });
  }
});

// Create a new course (instructor only)
router.post('/', [
  authenticate,
  isInstructor,
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, thumbnail, isPublished } = req.body;

    const course = new Course({
      title,
      description,
      instructor: req.userId,
      thumbnail: thumbnail || '',
      isPublished: isPublished || false
    });

    await course.save();
    await course.populate('instructor', 'name email');

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error creating course' });
  }
});

// Update a course (instructor only, must be course owner)
router.put('/:id', [
  authenticate,
  isInstructor
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const { title, description, thumbnail, isPublished } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();
    await course.populate('instructor', 'name email');

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Error updating course' });
  }
});

// Delete a course (instructor only, must be course owner)
router.delete('/:id', [authenticate, isInstructor], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    // Delete all modules and lessons associated with the course
    const modules = await Module.find({ course: course._id });
    for (const module of modules) {
      await Lesson.deleteMany({ module: module._id });
    }
    await Module.deleteMany({ course: course._id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Error deleting course' });
  }
});

// Create a module in a course
router.post('/:courseId/modules', [
  authenticate,
  isInstructor,
  body('title').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to add modules to this course' });
    }

    const { title, description, order } = req.body;

    const module = new Module({
      title,
      description: description || '',
      course: course._id,
      order: order || course.modules.length
    });

    await module.save();

    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Error creating module' });
  }
});

// Update a module
router.put('/modules/:moduleId', [authenticate, isInstructor], async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId).populate('course');

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this module' });
    }

    const { title, description, order } = req.body;

    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;

    await module.save();

    res.json({
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Error updating module' });
  }
});

// Delete a module
router.delete('/modules/:moduleId', [authenticate, isInstructor], async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId).populate('course');

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this module' });
    }

    // Delete all lessons in this module
    await Lesson.deleteMany({ module: module._id });

    // Remove module from course
    await Course.findByIdAndUpdate(module.course._id, {
      $pull: { modules: module._id }
    });

    await Module.findByIdAndDelete(req.params.moduleId);

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Error deleting module' });
  }
});

// Create a lesson in a module
router.post('/modules/:moduleId/lessons', [
  authenticate,
  isInstructor,
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const module = await Module.findById(req.params.moduleId).populate('course');

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to add lessons to this module' });
    }

    const { title, description, content, videoUrl, fileReference, order } = req.body;

    const lesson = new Lesson({
      title,
      description: description || '',
      content,
      videoUrl: videoUrl || '',
      fileReference: fileReference || '',
      module: module._id,
      order: order !== undefined ? order : module.lessons.length
    });

    await lesson.save();

    module.lessons.push(lesson._id);
    await module.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Error creating lesson' });
  }
});

// Update a lesson
router.put('/lessons/:lessonId', [authenticate, isInstructor], async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (lesson.module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this lesson' });
    }

    const { title, description, content, videoUrl, fileReference, order } = req.body;

    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (content) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (fileReference !== undefined) lesson.fileReference = fileReference;
    if (order !== undefined) lesson.order = order;

    await lesson.save();

    res.json({
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Error updating lesson' });
  }
});

// Delete a lesson
router.delete('/lessons/:lessonId', [authenticate, isInstructor], async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (lesson.module.course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this lesson' });
    }

    // Remove lesson from module
    await Module.findByIdAndUpdate(lesson.module._id, {
      $pull: { lessons: lesson._id }
    });

    // Delete associated quiz if exists
    if (lesson.quiz) {
      await Quiz.findByIdAndDelete(lesson.quiz);
    }

    await Lesson.findByIdAndDelete(req.params.lessonId);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Error deleting lesson' });
  }
});

// Get a specific lesson
router.get('/lessons/:lessonId', authenticate, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      })
      .populate('quiz');

    if (!lesson) {
      console.log('Lesson not found:', req.params.lessonId);
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (!lesson.module || !lesson.module.course) {
      console.log('Lesson missing module or course data:', lesson._id);
      return res.status(500).json({ error: 'Lesson data incomplete' });
    }

    // Check if user is enrolled or is the instructor
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: lesson.module.course._id
    });

    const isInstructor = lesson.module.course.instructor.toString() === req.userId.toString();

    if (!enrollment && !isInstructor) {
      console.log('User not enrolled or not instructor. UserId:', req.userId, 'CourseId:', lesson.module.course._id);
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Error fetching lesson', details: error.message });
  }
});

module.exports = router;

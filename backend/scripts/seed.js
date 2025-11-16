

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Quiz = require('../src/models/Quiz');
const Enrollment = require('../src/models/Enrollment');
const Progress = require('../src/models/Progress');
const QuizAttempt = require('../src/models/QuizAttempt');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment. Set it in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearDatabaseIfRequested() {
  if (String(process.env.DROP_DATABASE || '').toLowerCase() === 'true') {
    console.log('DROP_DATABASE=true -> Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped.');
  }
}

async function createCourseStructure(instructors, opts = {}) {
  const courses = [];
  for (const instructor of instructors) {
    const numCourses = opts.coursesPerInstructor ?? 2;
    for (let c = 0; c < numCourses; c++) {
      const course = await Course.create({
        title: faker.lorem.words(randInt(2, 5)),
        description: faker.lorem.paragraphs(1),
        instructor: instructor._id,
        thumbnail: faker.image.urlPicsumPhotos({ width: 640, height: 360 }),
        isPublished: true
      });

      // Modules
      const modules = [];
      const numModules = randInt(2, 4);
      for (let m = 0; m < numModules; m++) {
        const module = await Module.create({
          title: `Module ${m + 1}: ${faker.lorem.words(3)}`,
          description: faker.lorem.sentences(1),
          course: course._id,
          order: m
        });
        modules.push(module);

        // Lessons
        const lessons = [];
        const numLessons = randInt(2, 4);
        for (let l = 0; l < numLessons; l++) {
          const hasQuiz = Math.random() < 0.5; // half of lessons have quizzes
          const lesson = await Lesson.create({
            title: `Lesson ${l + 1}: ${faker.lorem.words(4)}`,
            description: faker.lorem.sentences(1),
            content: faker.lorem.paragraphs(2),
            videoUrl: '',
            fileReference: '',
            module: module._id,
            order: l
          });
          lessons.push(lesson);

          if (hasQuiz) {
            const questions = [];
            const qCount = randInt(3, 6);
            for (let qi = 0; qi < qCount; qi++) {
              const options = [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()];
              const correctAnswer = randInt(0, options.length - 1);
              questions.push({ question: faker.lorem.sentence(), options, correctAnswer });
            }

            const quiz = await Quiz.create({
              title: `${course.title} - ${lesson.title} Quiz`,
              lesson: lesson._id,
              questions,
              passingScore: 70
            });

            // link quiz to lesson
            lesson.quiz = quiz._id;
            await lesson.save();
          }
        }

        module.lessons = lessons.map(x => x._id);
        await module.save();
      }

      course.modules = modules.map(x => x._id);
      await course.save();

      courses.push(course);
    }
  }
  return courses;
}

async function enrollStudentsToCourses(students, courses) {
  const enrollPromises = [];
  for (const student of students) {
    // enroll each student in 1..min(3,courses.length) random courses
    const enrollCount = Math.max(1, Math.min(3, randInt(1, Math.min(3, courses.length))));
    const shuffled = faker.helpers.shuffle(courses);
    for (let i = 0; i < enrollCount; i++) {
      const course = shuffled[i];
      enrollPromises.push(
        Enrollment.create({ student: student._id, course: course._id }).catch(err => {
          // ignore duplicate enrollment errors
          if (err.code === 11000) return null;
          throw err;
        })
      );
    }
  }
  const enrollments = await Promise.all(enrollPromises);
  return enrollments.filter(Boolean);
}

async function createProgressAndAttempts(students, courses) {
  const progressPromises = [];
  const attemptPromises = [];

  for (const student of students) {
    // For each course student is enrolled in, randomly mark some lessons completed and attempt quizzes
    const enrollments = await Enrollment.find({ student: student._id }).populate({ path: 'course', populate: { path: 'modules', populate: { path: 'lessons' } } });
    for (const en of enrollments) {
      const course = en.course;
      if (!course || !course.modules) continue;

      for (const mod of course.modules) {
        if (!mod.lessons) continue;
        for (const lessonId of mod.lessons) {
          const lesson = await Lesson.findById(lessonId).populate('quiz');
          // Randomly mark completed
          if (Math.random() < 0.4) {
            const completed = Math.random() < 0.7;
            const p = Progress.create({ student: student._id, course: course._id, lesson: lesson._id, completed, completedAt: completed ? new Date() : null }).catch(err => {
              if (err.code === 11000) return null;
              throw err;
            });
            progressPromises.push(p);
          }

          // If lesson has quiz, randomly create attempts
          if (lesson && lesson.quiz && Math.random() < 0.6) {
            const quiz = await Quiz.findById(lesson.quiz);
            if (!quiz) continue;
            const answers = [];
            let correctCount = 0;
            for (let qi = 0; qi < quiz.questions.length; qi++) {
              const question = quiz.questions[qi];
              // randomly choose answer with some chance to be correct
              const shouldChooseCorrect = Math.random() < 0.6;
              const selected = shouldChooseCorrect ? question.correctAnswer : randInt(0, question.options.length - 1);
              if (selected === question.correctAnswer) correctCount++;
              answers.push({ questionIndex: qi, selectedAnswer: selected });
            }
            const score = Math.round((correctCount / quiz.questions.length) * 100);
            const passed = score >= quiz.passingScore;
            attemptPromises.push(
              QuizAttempt.create({ student: student._id, quiz: quiz._id, lesson: lesson._id, answers, score, passed }).catch(err => {
                if (err.code === 11000) return null;
                throw err;
              })
            );
          }
        }
      }
    }
  }

  await Promise.all(progressPromises);
  await Promise.all(attemptPromises);
}

async function run() {
  try {
    console.log('Connecting to DB...');
    await connect();
    console.log('Connected.');
    await clearDatabaseIfRequested();

    console.log('Fetching instructors and students from database...');
    const instructors = await User.find({ role: 'instructor' }).limit(3);
    const students = await User.find({ role: 'student' }).limit(30);
    console.log(`Found ${instructors.length} instructors and ${students.length} students.`);
    if (instructors.length === 0 || students.length === 0) {
      console.error('ERROR: No instructors or students found. Please create users first.');
      process.exit(1);
    }

    console.log('Creating courses/modules/lessons/quizzes...');
    const courses = await createCourseStructure(instructors, { coursesPerInstructor: 2 });
    console.log(`Created ${courses.length} courses.`);

    console.log('Enrolling students...');
    const enrolls = await enrollStudentsToCourses(students, courses);
    console.log(`Created ${enrolls.length} enrollments.`);

    console.log('Creating progress entries and quiz attempts...');
    await createProgressAndAttempts(students, courses);

    console.log('Seeding complete.');

    // Show counts
    const counts = await Promise.all([
      Course.countDocuments(),
      Module.countDocuments(),
      Lesson.countDocuments(),
      Quiz.countDocuments(),
      Enrollment.countDocuments(),
      Progress.countDocuments(),
      QuizAttempt.countDocuments()
    ]);
    console.log('Counts:');
    console.log(`Courses: ${counts[0]}, Modules: ${counts[1]}, Lessons: ${counts[2]}, Quizzes: ${counts[3]}, Enrollments: ${counts[4]}, Progress: ${counts[5]}, QuizAttempts: ${counts[6]}`);

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

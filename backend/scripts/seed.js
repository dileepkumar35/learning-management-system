

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Quiz = require('../src/models/Quiz');
const Enrollment = require('../src/models/Enrollment');
const Progress = require('../src/models/Progress');
const QuizAttempt = require('../src/models/QuizAttempt');

// Dummy data JSON
const COURSE_DATA = {
  titles: [
    'Introduction to Web Development',
    'Advanced JavaScript Programming',
    'React and Modern Frontend',
    'Node.js Backend Development',
    'Python for Data Science',
    'Machine Learning Fundamentals',
    'Database Design and SQL',
    'Mobile App Development',
    'DevOps and Cloud Computing',
    'Cybersecurity Essentials'
  ],
  descriptions: [
    'Learn the fundamentals of building modern web applications from scratch. This comprehensive course covers HTML, CSS, and JavaScript basics.',
    'Master advanced programming concepts and build scalable applications. Dive deep into asynchronous programming, design patterns, and best practices.',
    'Explore cutting-edge technologies and industry best practices. Build real-world projects and learn from experienced developers.',
    'Build robust server-side applications with modern frameworks. Learn RESTful API design, authentication, and database integration.',
    'Gain practical skills in analysis and visualization. Work with real datasets and learn industry-standard tools and libraries.',
    'Understand core concepts and algorithms in AI. Implement machine learning models and understand their practical applications.'
  ],
  moduleTopics: [
    ['Getting Started', 'Core Concepts', 'Advanced Topics', 'Best Practices'],
    ['Fundamentals', 'Intermediate Concepts', 'Advanced Techniques', 'Real-world Applications'],
    ['Introduction', 'Building Blocks', 'Advanced Features', 'Project Development'],
    ['Basics', 'Essential Skills', 'Professional Techniques', 'Industry Standards']
  ],
  lessonTitles: [
    ['Introduction to the Topic', 'Understanding the Basics', 'Core Principles', 'Practical Examples'],
    ['Getting Started', 'Working with Components', 'Advanced Patterns', 'Performance Optimization'],
    ['Setup and Configuration', 'First Steps', 'Deep Dive', 'Best Practices and Tips'],
    ['Overview', 'Hands-on Practice', 'Common Pitfalls', 'Real-world Scenarios']
  ],
  lessonContent: [
    'In this lesson, we will explore the fundamental concepts that form the foundation of this topic. You will learn key principles and see practical examples that demonstrate real-world applications. By the end of this lesson, you will have a solid understanding of the core concepts.\n\nWe will cover important techniques and methodologies that are widely used in the industry. Through hands-on exercises, you will gain practical experience and build confidence in applying these concepts.',
    'This comprehensive lesson covers essential skills and knowledge you need to master. We will work through practical examples and discuss best practices used by professionals in the field.\n\nYou will learn how to apply these concepts effectively and avoid common mistakes. The lesson includes detailed explanations and step-by-step guidance to ensure thorough understanding.',
    'Building on previous knowledge, this lesson introduces advanced concepts and techniques. You will learn how to solve complex problems and implement sophisticated solutions.\n\nWe will explore industry-standard approaches and modern methodologies. Through practical exercises, you will develop the skills needed to handle real-world challenges confidently.'
  ],
  quizQuestions: [
    'What is the primary purpose of this concept?',
    'Which of the following best describes the key principle?',
    'How would you implement this feature correctly?',
    'What is the recommended approach for solving this problem?',
    'Which statement accurately explains this functionality?',
    'What are the benefits of using this technique?'
  ],
  quizOptions: [
    ['To improve performance', 'To enhance security', 'To simplify development', 'To reduce costs'],
    ['Modular design', 'Rapid execution', 'Complex architecture', 'Simple implementation'],
    ['Using global variables', 'Following best practices', 'Avoiding documentation', 'Skipping testing'],
    ['Trial and error', 'Systematic approach', 'Random selection', 'Ignoring requirements'],
    ['It increases complexity', 'It improves maintainability', 'It slows performance', 'It limits functionality'],
    ['Faster development', 'Better code quality', 'Reduced errors', 'All of the above']
  ]
};

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

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
  let courseIndex = 0;
  
  for (const instructor of instructors) {
    const numCourses = opts.coursesPerInstructor ?? 2;
    for (let c = 0; c < numCourses; c++) {
      const courseTitle = COURSE_DATA.titles[courseIndex % COURSE_DATA.titles.length];
      const courseDesc = COURSE_DATA.descriptions[courseIndex % COURSE_DATA.descriptions.length];
      courseIndex++;
      
      const course = await Course.create({
        title: courseTitle,
        description: courseDesc,
        instructor: instructor._id,
        thumbnail: `https://picsum.photos/seed/${courseIndex}/640/360`,
        isPublished: true
      });

      // Modules
      const modules = [];
      const numModules = randInt(2, 4);
      const moduleTopics = getRandomItem(COURSE_DATA.moduleTopics);
      
      for (let m = 0; m < numModules; m++) {
        const moduleTopic = moduleTopics[m % moduleTopics.length];
        const module = await Module.create({
          title: `Module ${m + 1}: ${moduleTopic}`,
          description: `This module covers ${moduleTopic.toLowerCase()} and related concepts. You will gain hands-on experience through practical examples.`,
          course: course._id,
          order: m
        });
        modules.push(module);

        // Lessons
        const lessons = [];
        const numLessons = randInt(2, 4);
        const lessonTitles = getRandomItem(COURSE_DATA.lessonTitles);
        
        for (let l = 0; l < numLessons; l++) {
          const hasQuiz = Math.random() < 0.5; // half of lessons have quizzes
          const lessonTitle = lessonTitles[l % lessonTitles.length];
          const lessonContent = getRandomItem(COURSE_DATA.lessonContent);
          
          const lesson = await Lesson.create({
            title: `Lesson ${l + 1}: ${lessonTitle}`,
            description: `Learn about ${lessonTitle.toLowerCase()} in this comprehensive lesson.`,
            content: lessonContent,
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
              const question = COURSE_DATA.quizQuestions[qi % COURSE_DATA.quizQuestions.length];
              const options = COURSE_DATA.quizOptions[qi % COURSE_DATA.quizOptions.length];
              const correctAnswer = randInt(0, options.length - 1);
              questions.push({ question, options, correctAnswer });
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
    const shuffled = shuffleArray(courses);
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

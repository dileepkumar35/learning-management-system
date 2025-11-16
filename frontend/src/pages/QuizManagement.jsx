import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add,
  Delete,
  Edit,
  Quiz as QuizIcon,
  Save,
} from '@mui/icons-material';
import { coursesAPI, quizzesAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  height: '100%',
  padding: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const QuizManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizData, setQuizData] = useState({
    title: '',
    passingScore: 70,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      },
    ],
  });

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(courseId);
      setCourse(response.data);

      // Extract all lessons from modules
      const allLessons = [];
      response.data.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          allLessons.push({
            ...lesson,
            moduleName: module.title,
          });
        });
      });
      setLessons(allLessons);
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (lesson) => {
    setSelectedLesson(lesson);
    if (lesson.quiz) {
      // Load existing quiz
      loadQuiz(lesson.quiz);
    } else {
      // Reset for new quiz
      setQuizData({
        title: `${lesson.title} Quiz`,
        passingScore: 70,
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
          },
        ],
      });
    }
    setDialogOpen(true);
  };

  const loadQuiz = async (quizId) => {
    try {
      const response = await quizzesAPI.getById(quizId);
      setQuizData({
        title: response.data.title,
        passingScore: response.data.passingScore,
        questions: response.data.questions,
      });
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('Failed to load quiz');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLesson(null);
  };

  const handleAddQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleSaveQuiz = async () => {
    try {
      if (selectedLesson.quiz) {
        // Update existing quiz
        await quizzesAPI.update(selectedLesson.quiz, {
          ...quizData,
          lessonId: selectedLesson._id,
        });
        alert('Quiz updated successfully!');
      } else {
        // Create new quiz
        await quizzesAPI.create({
          ...quizData,
          lessonId: selectedLesson._id,
        });
        alert('Quiz created successfully!');
      }
      handleCloseDialog();
      loadCourse();
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError('Failed to save quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizzesAPI.delete(quizId);
        alert('Quiz deleted successfully!');
        loadCourse();
      } catch (err) {
        console.error('Error deleting quiz:', err);
        setError('Failed to delete quiz');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            sx={{ mb: 2 }}
          >
            ← Back to Course
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#232536', mb: 1 }}>
            Quiz Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {course?.title}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <StyledCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Lessons & Quizzes
            </Typography>

            {lessons.length === 0 ? (
              <Alert severity="info">
                No lessons found. Add lessons to create quizzes.
              </Alert>
            ) : (
              <Box>
                {lessons.map((lesson) => (
                  <Paper
                    key={lesson._id}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {lesson.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Module: {lesson.moduleName}
                        </Typography>
                        {lesson.quiz && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              icon={<QuizIcon />}
                              label="Quiz Available"
                              size="small"
                              color="success"
                            />
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant={lesson.quiz ? 'outlined' : 'contained'}
                          startIcon={lesson.quiz ? <Edit /> : <Add />}
                          onClick={() => handleOpenDialog(lesson)}
                          sx={{
                            backgroundColor: lesson.quiz ? 'transparent' : '#ffda1b',
                            color: lesson.quiz ? '#232536' : '#232536',
                            '&:hover': {
                              backgroundColor: '#232536',
                              color: '#fff',
                            },
                          }}
                        >
                          {lesson.quiz ? 'Edit Quiz' : 'Add Quiz'}
                        </Button>
                        {lesson.quiz && (
                          <IconButton
                            onClick={() => handleDeleteQuiz(lesson.quiz)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </StyledCard>

        {/* Quiz Editor Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedLesson?.quiz ? 'Edit Quiz' : 'Create Quiz'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLesson?.title}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Quiz Title"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              type="number"
              label="Passing Score (%)"
              value={quizData.passingScore}
              onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Questions
            </Typography>

            {quizData.questions.map((question, qIndex) => (
              <Paper
                key={qIndex}
                sx={{
                  p: 3,
                  mb: 3,
                  border: '2px solid #e5e7eb',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Question {qIndex + 1}
                  </Typography>
                  {quizData.questions.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Question"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Options
                </Typography>

                {question.options.map((option, oIndex) => (
                  <TextField
                    key={oIndex}
                    fullWidth
                    label={`Option ${oIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    sx={{ mb: 1 }}
                  />
                ))}

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.correctAnswer}
                    label="Correct Answer"
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                  >
                    {question.options.map((_, oIndex) => (
                      <MenuItem key={oIndex} value={oIndex}>
                        Option {oIndex + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddQuestion}
              fullWidth
            >
              Add Question
            </Button>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveQuiz}
              disabled={
                !quizData.title ||
                quizData.questions.some(
                  (q) => !q.question || q.options.some((o) => !o)
                )
              }
              sx={{
                backgroundColor: '#ffda1b',
                color: '#232536',
                '&:hover': {
                  backgroundColor: '#232536',
                  color: '#fff',
                },
              }}
            >
              Save Quiz
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default QuizManagement;

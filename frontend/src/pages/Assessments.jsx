import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Quiz,
  CheckCircle,
  Cancel,
  TrendingUp,
  NavigateNext,
  NavigateBefore,
  Timer,
} from '@mui/icons-material';
import { enrollmentsAPI, quizzesAPI, progressAPI } from '../services/api';

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

const Assessments = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizStarted && timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [quizStarted, timeLeft]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const enrollmentsResponse = await enrollmentsAPI.getMyEnrollments();
      const enrollments = enrollmentsResponse.data || [];

      // Get all quizzes from enrolled courses
      const allQuizzes = [];
      for (const enrollment of enrollments) {
        const courseResponse = await progressAPI.getCourseProgress(enrollment.course._id);
        // Here we would fetch actual quizzes - for now using mock data structure
      }

      setQuizzes(allQuizzes);
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizCompleted(false);
    setTimeLeft(quiz.duration ? quiz.duration * 60 : 1800); // Default 30 min
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const answersArray = Object.entries(answers).map(([questionIndex, selectedAnswer]) => ({
        questionIndex: parseInt(questionIndex),
        selectedAnswer: parseInt(selectedAnswer),
      }));

      const response = await quizzesAPI.submit(selectedQuiz._id, answersArray);
      setScore(response.data.score);
      setQuizCompleted(true);
      setQuizStarted(false);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
    }
  };

  const handleCloseResults = () => {
    setSelectedQuiz(null);
    setQuizCompleted(false);
    setScore(null);
    loadQuizzes();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  // Quiz View
  if (quizStarted && selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, sm: 2.5, md: 3 }, backgroundColor: '#232536', color: '#fff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>{selectedQuiz.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant="h6" sx={{ color: timeLeft < 60 ? '#ef4444' : '#fff', fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', height: { xs: 6, sm: 8 } }} />
            <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Question {currentQuestion + 1} of {selectedQuiz.questions.length}
            </Typography>
          </Paper>

          <StyledCard>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                {question.question}
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[currentQuestion] !== undefined ? answers[currentQuestion] : ''}
                  onChange={(e) => handleAnswerChange(currentQuestion, parseInt(e.target.value))}
                >
                  {question.options.map((option, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        mb: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: answers[currentQuestion] === index ? '#ffda1b' : '#e5e7eb',
                        backgroundColor: answers[currentQuestion] === index ? 'rgba(255, 218, 27, 0.1)' : '#fff',
                        '&:hover': {
                          borderColor: '#ffda1b',
                          backgroundColor: 'rgba(255, 218, 27, 0.05)',
                        },
                      }}
                      onClick={() => handleAnswerChange(currentQuestion, index)}
                    >
                      <FormControlLabel
                        value={index}
                        control={<Radio />}
                        label={option}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 3, sm: 4 }, flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  sx={{ py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Previous
                </Button>

                {currentQuestion === selectedQuiz.questions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length !== selectedQuiz.questions.length}
                    sx={{
                      backgroundColor: '#ffda1b',
                      color: '#232536',
                      py: { xs: 1, sm: 1.2 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      '&:hover': {
                        backgroundColor: '#232536',
                        color: '#fff',
                      },
                    }}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<NavigateNext />}
                    onClick={handleNextQuestion}
                    sx={{
                      backgroundColor: '#ffda1b',
                      color: '#232536',
                      py: { xs: 1, sm: 1.2 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      '&:hover': {
                        backgroundColor: '#232536',
                        color: '#fff',
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Container>
      </Box>
    );
  }

  // Results Dialog
  const ResultsDialog = () => (
    <Dialog open={quizCompleted} onClose={handleCloseResults} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pt: { xs: 3, sm: 4 } }}>
        {score >= (selectedQuiz?.passingScore || 70) ? (
          <CheckCircle sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#10b981', mb: 2 }} />
        ) : (
          <Cancel sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#ef4444', mb: 2 }} />
        )}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
          {score >= (selectedQuiz?.passingScore || 70) ? 'Congratulations!' : 'Keep Practicing!'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {score >= (selectedQuiz?.passingScore || 70)
            ? 'You passed the assessment!'
            : 'You need more practice. Try again!'}
        </Typography>

        <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, backgroundColor: '#f9fafb', mb: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: 600, color: score >= (selectedQuiz?.passingScore || 70) ? '#10b981' : '#ef4444', fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' } }}>
            {score}%
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Your Score
          </Typography>
        </Paper>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid item size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Passing Score
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              {selectedQuiz?.passingScore || 70}%
            </Typography>
          </Grid>
          <Grid item size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Questions Answered
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              {Object.keys(answers).length} / {selectedQuiz?.questions?.length}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={handleCloseResults} variant="outlined" sx={{ py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Close
        </Button>
        <Button
          onClick={() => handleStartQuiz(selectedQuiz)}
          variant="contained"
          sx={{
            backgroundColor: '#ffda1b',
            color: '#232536',
            py: { xs: 1, sm: 1.2 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '&:hover': {
              backgroundColor: '#232536',
              color: '#fff',
            },
          }}
        >
          Retake Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Main Assessments List
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#232536', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
            Assessments
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Test your knowledge and track your progress
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {quizzes.length === 0 && (
            <Grid item size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 7, md: 8 } }}>
                <Quiz sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#e2e8f0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                  No assessments available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Complete some lessons to unlock quizzes
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/courses')}
                  sx={{
                    backgroundColor: '#ffda1b',
                    color: '#232536',
                    py: { xs: 1, sm: 1.2 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover': {
                      backgroundColor: '#232536',
                      color: '#fff',
                    },
                  }}
                >
                  Browse Courses
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {ResultsDialog()}
    </Box>
  );
};

export default Assessments;

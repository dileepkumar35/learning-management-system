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
import Navbar from '../components/Navbar';
import { enrollmentsAPI, quizzesAPI, progressAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
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
      <Box>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Box>
    );
  }

  // Quiz View
  if (quizStarted && selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#232536', color: '#fff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{selectedQuiz.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer />
                <Typography variant="h6" sx={{ color: timeLeft < 60 ? '#ef4444' : '#fff' }}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Question {currentQuestion + 1} of {selectedQuiz.questions.length}
            </Typography>
          </Paper>

          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
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
                        p: 2,
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
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
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        {score >= (selectedQuiz?.passingScore || 70) ? (
          <CheckCircle sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
        ) : (
          <Cancel sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
        )}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {score >= (selectedQuiz?.passingScore || 70) ? 'Congratulations!' : 'Keep Practicing!'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {score >= (selectedQuiz?.passingScore || 70)
            ? 'You passed the assessment!'
            : 'You need more practice. Try again!'}
        </Typography>

        <Paper sx={{ p: 3, backgroundColor: '#f9fafb', mb: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: 600, color: score >= (selectedQuiz?.passingScore || 70) ? '#10b981' : '#ef4444' }}>
            {score}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your Score
          </Typography>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Passing Score
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedQuiz?.passingScore || 70}%
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Questions Answered
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Object.keys(answers).length} / {selectedQuiz?.questions?.length}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={handleCloseResults} variant="outlined">
          Close
        </Button>
        <Button
          onClick={() => handleStartQuiz(selectedQuiz)}
          variant="contained"
          sx={{
            backgroundColor: '#ffda1b',
            color: '#232536',
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
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#232536', mb: 1 }}>
            Assessments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test your knowledge and track your progress
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {quizzes.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Quiz sx={{ fontSize: 80, color: '#e2e8f0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No assessments available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Complete some lessons to unlock quizzes
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/courses')}
                  sx={{
                    backgroundColor: '#ffda1b',
                    color: '#232536',
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

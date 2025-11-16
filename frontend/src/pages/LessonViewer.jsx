import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactPlayer from 'react-player';
import { coursesAPI, progressAPI, quizzesAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  height: '100%',
  padding: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const MarkdownContent = styled(Box)(({ theme }) => ({
  '& h1': {
    fontSize: '2rem',
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    color: '#232536',
  },
  '& h2': {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
    color: '#232536',
  },
  '& h3': {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: '#232536',
  },
  '& p': {
    marginBottom: theme.spacing(2),
    lineHeight: 1.7,
  },
  '& code': {
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: theme.spacing(2),
    borderRadius: '8px',
    overflow: 'auto',
    marginBottom: theme.spacing(2),
    '& code': {
      backgroundColor: 'transparent',
      color: '#e2e8f0',
      padding: 0,
    },
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
  },
  '& blockquote': {
    borderLeft: '4px solid #ffda1b',
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    marginBottom: theme.spacing(2),
    fontStyle: 'italic',
    color: '#4b5563',
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: theme.spacing(2),
  },
  '& th, & td': {
    border: '1px solid #e5e7eb',
    padding: theme.spacing(1),
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: '#f9fafb',
    fontWeight: 600,
  },
}));

const LessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      setError(''); // Clear any previous errors
      setLoading(true);
      const response = await coursesAPI.getLesson(id);
      setLesson(response.data);
      
      if (response.data.quiz) {
        const quizId = typeof response.data.quiz === 'object' ? response.data.quiz._id : response.data.quiz;
        const quizResponse = await quizzesAPI.getById(quizId);
        setQuiz(quizResponse.data);
        
        // Load quiz attempts
        try {
          const attemptsResponse = await quizzesAPI.getAttempts(quizId);
          setQuizAttempts(attemptsResponse.data || []);
        } catch (err) {
          console.error('Error loading quiz attempts:', err);
        }
      }
    } catch (err) {
      setError('Failed to load lesson');
      setLesson(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await progressAPI.markComplete(id, lesson.module.course);
      setCompleted(true);
    } catch (err) {
      setError('Failed to mark lesson as complete');
      console.error(err);
    }
  };

  const handleOpenQuiz = () => {
    setQuizOpen(true);
    setQuizAnswers({});
    setQuizResult(null);
    setCurrentQuestion(0);
    setActiveTab(0);
  };

  const handleQuizAnswerChange = (questionIndex, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
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
      const answers = Object.entries(quizAnswers).map(([questionIndex, selectedAnswer]) => ({
        questionIndex: parseInt(questionIndex),
        selectedAnswer: parseInt(selectedAnswer),
      }));

      const response = await quizzesAPI.submit(quiz._id, answers);
      setQuizResult(response.data);
      
      // Reload attempts
      const attemptsResponse = await quizzesAPI.getAttempts(quiz._id);
      setQuizAttempts(attemptsResponse.data || []);
      
      setActiveTab(1); // Switch to results tab
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    }
  };

  const handleCloseQuiz = () => {
    setQuizOpen(false);
    setQuizAnswers({});
    setQuizResult(null);
    setCurrentQuestion(0);
    setActiveTab(0);
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
    setCurrentQuestion(0);
    setActiveTab(0);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (error && !lesson) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<NavigateBeforeIcon />}
            sx={{
              mb: 2,
              color: '#232536',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: 'rgba(255, 218, 27, 0.1)',
              },
            }}
          >
            Back to Course
          </Button>

          {error && !lesson && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <StyledCard>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#232536', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                    {lesson?.title}
                  </Typography>
                  {lesson?.description && (
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {lesson.description}
                    </Typography>
                  )}
                </Box>
                {completed && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed"
                    color="success"
                    sx={{ ml: { xs: 0, sm: 2 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Video Player */}
              {lesson?.videoUrl && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PlayArrowIcon sx={{ mr: 1 }} />
                    Video Lesson
                  </Typography>
                  <Paper
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      backgroundColor: '#000',
                    }}
                  >
                    <ReactPlayer
                      url={lesson.videoUrl}
                      controls
                      width="100%"
                      height="auto"
                      style={{ maxHeight: '500px' }}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 }
                        }
                      }}
                    />
                  </Paper>
                </Box>
              )}

              {/* Lesson Content with Markdown */}
              {lesson?.content && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Lesson Content
                  </Typography>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: '#fff',
                    }}
                  >
                    <MarkdownContent>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lesson.content}
                      </ReactMarkdown>
                    </MarkdownContent>
                  </Paper>
                </Box>
              )}

              {/* File Reference */}
              {lesson?.fileReference && (
                <Box sx={{ mb: 4 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Additional Resource:</strong> {lesson.fileReference}
                    </Typography>
                  </Alert>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 4 }}>
                {!completed ? (
                  <Button
                    variant="contained"
                    onClick={handleMarkComplete}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      backgroundColor: '#10b981',
                      '&:hover': {
                        backgroundColor: '#059669',
                      },
                    }}
                  >
                    Mark as Complete
                  </Button>
                ) : (
                  <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ flex: 1, borderRadius: 2 }}
                  >
                    Lesson completed!
                  </Alert>
                )}

                {quiz && (
                  <Button
                    variant="contained"
                    startIcon={<QuizIcon />}
                    onClick={handleOpenQuiz}
                    sx={{
                      backgroundColor: '#ffda1b',
                      color: '#232536',
                      '&:hover': {
                        backgroundColor: '#232536',
                        color: '#fff',
                      },
                    }}
                  >
                    {quizAttempts.length > 0 ? 'Retake Quiz' : 'Take Quiz'}
                  </Button>
                )}
              </Box>

              {/* Quiz Attempts History */}
              {quizAttempts.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon sx={{ mr: 1 }} />
                    Previous Attempts
                  </Typography>
                  <List>
                    {quizAttempts.slice(0, 5).map((attempt, index) => (
                      <ListItem
                        key={attempt._id}
                        sx={{
                          border: '1px solid #e5e7eb',
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: attempt.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1">
                                Attempt #{quizAttempts.length - index}
                              </Typography>
                              <Chip
                                label={`${attempt.score}%`}
                                color={attempt.passed ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={new Date(attempt.attemptedAt).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </StyledCard>

          {/* Enhanced Quiz Dialog */}
          <Dialog
            open={quizOpen}
            onClose={handleCloseQuiz}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb', pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {quiz?.title}
                </Typography>
                {!quizResult && (
                  <Chip
                    label={`Question ${currentQuestion + 1}/${quiz?.questions?.length || 0}`}
                    color="primary"
                  />
                )}
              </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Quiz" disabled={!!quizResult} />
                <Tab label="Results" disabled={!quizResult} />
              </Tabs>

              {/* Quiz Tab */}
              {activeTab === 0 && !quizResult && quiz?.questions && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    {quiz.questions[currentQuestion]?.question}
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={quizAnswers[currentQuestion] !== undefined ? quizAnswers[currentQuestion] : ''}
                      onChange={(e) => handleQuizAnswerChange(currentQuestion, parseInt(e.target.value))}
                    >
                      {quiz.questions[currentQuestion]?.options.map((option, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            mb: 2,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: quizAnswers[currentQuestion] === index ? '#ffda1b' : '#e5e7eb',
                            backgroundColor: quizAnswers[currentQuestion] === index ? 'rgba(255, 218, 27, 0.1)' : '#fff',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#ffda1b',
                              backgroundColor: 'rgba(255, 218, 27, 0.05)',
                            },
                          }}
                          onClick={() => handleQuizAnswerChange(currentQuestion, index)}
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<NavigateBeforeIcon />}
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {quiz.questions.map((_, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: quizAnswers[idx] !== undefined ? '#10b981' : '#e5e7eb',
                          }}
                        />
                      ))}
                    </Box>

                    {currentQuestion === quiz.questions.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length !== quiz.questions.length}
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
                        endIcon={<NavigateNextIcon />}
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
                </Box>
              )}

              {/* Results Tab */}
              {activeTab === 1 && quizResult && (
                <Box sx={{ textAlign: 'center' }}>
                  {quizResult.passed ? (
                    <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
                  ) : (
                    <QuizIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
                  )}

                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {quizResult.passed ? 'Congratulations!' : 'Keep Practicing!'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {quizResult.passed
                      ? 'You passed the quiz!'
                      : 'You need more practice. Try again!'}
                  </Typography>

                  <Paper sx={{ p: 3, backgroundColor: '#f9fafb', mb: 3, display: 'inline-block', minWidth: 200 }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 600,
                        color: quizResult.passed ? '#10b981' : '#ef4444',
                      }}
                    >
                      {quizResult.score}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your Score
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {quizResult.correctAnswers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Correct
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {quizResult.totalQuestions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {quizResult.passingScore}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Passing
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
              {quizResult ? (
                <>
                  <Button onClick={handleCloseQuiz}>Close</Button>
                  <Button
                    onClick={handleRetakeQuiz}
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
                </>
              ) : (
                <Button onClick={handleCloseQuiz}>Cancel</Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default LessonViewer;

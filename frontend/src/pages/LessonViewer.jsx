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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { coursesAPI, progressAPI, quizzesAPI } from '../services/api';

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

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      const response = await coursesAPI.getLesson(id);
      setLesson(response.data);
      
      if (response.data.quiz) {
        const quizResponse = await quizzesAPI.getById(response.data.quiz);
        setQuiz(quizResponse.data);
      }
    } catch (err) {
      setError('Failed to load lesson');
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
  };

  const handleQuizAnswerChange = (questionIndex, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleSubmitQuiz = async () => {
    try {
      const answers = Object.entries(quizAnswers).map(([questionIndex, selectedAnswer]) => ({
        questionIndex: parseInt(questionIndex),
        selectedAnswer: parseInt(selectedAnswer),
      }));

      const response = await quizzesAPI.submit(quiz._id, answers);
      setQuizResult(response.data);
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    }
  };

  const handleCloseQuiz = () => {
    setQuizOpen(false);
    setQuizAnswers({});
    setQuizResult(null);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (error && !lesson) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          ← Back to Course
        </Button>

        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {lesson?.title}
            </Typography>
            {lesson?.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {lesson.description}
              </Typography>
            )}

            {lesson?.videoUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Video
                </Typography>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Video URL: {lesson.videoUrl}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Lesson Content
              </Typography>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {lesson?.content}
                </Typography>
              </Paper>
            </Box>

            {lesson?.fileReference && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  File Reference: {lesson.fileReference}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {!completed && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMarkComplete}
                  startIcon={<CheckCircleIcon />}
                >
                  Mark as Complete
                </Button>
              )}
              {completed && (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Lesson completed!
                </Alert>
              )}
              {quiz && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleOpenQuiz}
                >
                  Take Quiz
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Quiz Dialog */}
        <Dialog open={quizOpen} onClose={handleCloseQuiz} maxWidth="md" fullWidth>
          <DialogTitle>{quiz?.title}</DialogTitle>
          <DialogContent>
            {quizResult ? (
              <Box>
                <Alert severity={quizResult.passed ? 'success' : 'warning'} sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Score: {quizResult.score}%
                  </Typography>
                  <Typography>
                    {quizResult.correctAnswers} out of {quizResult.totalQuestions} correct
                  </Typography>
                  <Typography>
                    {quizResult.passed ? 'Passed!' : `Need ${quizResult.passingScore}% to pass`}
                  </Typography>
                </Alert>
              </Box>
            ) : (
              quiz?.questions.map((question, qIndex) => (
                <Box key={qIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {qIndex + 1}. {question.question}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={quizAnswers[qIndex] !== undefined ? quizAnswers[qIndex] : ''}
                      onChange={(e) => handleQuizAnswerChange(qIndex, parseInt(e.target.value))}
                    >
                      {question.options.map((option, oIndex) => (
                        <FormControlLabel
                          key={oIndex}
                          value={oIndex}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>
              ))
            )}
          </DialogContent>
          <DialogActions>
            {quizResult ? (
              <Button onClick={handleCloseQuiz} color="primary">
                Close
              </Button>
            ) : (
              <>
                <Button onClick={handleCloseQuiz}>Cancel</Button>
                <Button
                  onClick={handleSubmitQuiz}
                  variant="contained"
                  color="primary"
                  disabled={Object.keys(quizAnswers).length !== quiz?.questions.length}
                >
                  Submit Quiz
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LessonViewer;

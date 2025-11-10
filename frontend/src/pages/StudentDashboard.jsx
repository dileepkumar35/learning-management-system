import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import { progressAPI } from '../services/api';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await progressAPI.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Dashboard
        </Typography>

        {dashboard?.courses.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            You haven't enrolled in any courses yet.{' '}
            <RouterLink to="/courses">Browse courses</RouterLink>
          </Alert>
        ) : (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              My Courses
            </Typography>
            <Grid container spacing={3}>
              {dashboard?.courses.map((course) => (
                <Grid item xs={12} md={6} key={course.courseId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {course.courseTitle}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Progress: {course.completedLessons} / {course.totalLessons} lessons
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={course.progressPercentage}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {course.progressPercentage}%
                        </Typography>
                      </Box>
                      {course.suggestedLesson && (
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            label="Next Lesson"
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" component="span">
                            {course.suggestedLesson.title}
                          </Typography>
                        </Box>
                      )}
                      {course.recentQuiz && (
                        <Typography variant="body2" color="text.secondary">
                          Last Quiz: {course.recentQuiz.score}%{' '}
                          {course.recentQuiz.passed ? '✓' : '✗'}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        component={RouterLink}
                        to={`/courses/${course.courseId}`}
                        size="small"
                        color="primary"
                      >
                        Continue Learning
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {dashboard?.recentQuizzes.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Recent Quiz Attempts
                </Typography>
                <Grid container spacing={2}>
                  {dashboard.recentQuizzes.slice(0, 5).map((attempt) => (
                    <Grid item xs={12} key={attempt._id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs>
                              <Typography variant="body1">
                                {attempt.lesson?.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(attempt.attemptedAt).toLocaleDateString()}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Chip
                                label={`${attempt.score}%`}
                                color={attempt.passed ? 'success' : 'error'}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default StudentDashboard;

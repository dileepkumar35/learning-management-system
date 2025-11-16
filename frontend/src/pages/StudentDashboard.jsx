import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Paper,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  EmojiEvents,
  Assignment,
  CheckCircle,
  PlayArrow,
} from '@mui/icons-material';
import { progressAPI, certificatesAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  textAlign: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '160px',
  height: '100%',
  width: '100%',
  maxWidth: '200px',
  margin: '0 auto',
}));

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [certificateEligibility, setCertificateEligibility] = useState({});

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await progressAPI.getDashboard();
      setDashboard(response.data);

      // Check certificate eligibility for completed courses
      const courses = response.data.courses || [];
      const eligibilityChecks = {};
      
      for (const course of courses) {
        if (course.progressPercentage === 100) {
          try {
            const eligResponse = await certificatesAPI.checkEligibility(course.courseId);
            eligibilityChecks[course.courseId] = eligResponse.data;
          } catch (err) {
            console.error(`Error checking eligibility for ${course.courseId}:`, err);
          }
        }
      }
      
      setCertificateEligibility(eligibilityChecks);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (courseId) => {
    try {
      await certificatesAPI.issue(courseId);
      alert('Certificate issued successfully!');
      navigate('/certificates');
    } catch (err) {
      console.error('Error issuing certificate:', err);
      alert('Failed to issue certificate');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 2, sm: 4 } }}>
            <LinearProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  const totalCourses = dashboard?.courses.length || 0;
  const completedCourses = dashboard?.courses.filter(c => c.progressPercentage === 100).length || 0;
  const inProgressCourses = dashboard?.courses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100).length || 0;
  const totalLessons = dashboard?.courses.reduce((sum, c) => sum + c.completedLessons, 0) || 0;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#232536', mb: 1 }}>
            My Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Track your learning progress and achievements
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {totalCourses}
              </Typography>
              <Typography variant="body2">Enrolled</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {completedCourses}
              </Typography>
              <Typography variant="body2">Completed</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {inProgressCourses}
              </Typography>
              <Typography variant="body2">In Progress</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {totalLessons}
              </Typography>
              <Typography variant="body2">Lessons Done</Typography>
            </StatCard>
          </Grid>
        </Grid>

        {dashboard?.courses.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              You haven't enrolled in any courses yet.{' '}
              <RouterLink to="/courses" style={{ color: '#667eea', fontWeight: 600 }}>
                Browse courses
              </RouterLink>
            </Alert>
          ) : (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700, color: '#232536' }}>
                My Courses
              </Typography>
              <Grid container spacing={3}>
                {dashboard?.courses.map((course) => {
                  const eligibility = certificateEligibility[course.courseId];
                  return (
                    <Grid item xs={12} sm={6} md={4} key={course.courseId}>
                      <StyledCard>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                              {course.courseTitle}
                            </Typography>
                            {course.progressPercentage === 100 && (
                              <CheckCircle sx={{ color: '#10b981', ml: 1 }} />
                            )}
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Progress
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {course.progressPercentage}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={course.progressPercentage}
                              sx={{
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: '#e5e7eb',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 1,
                                  backgroundColor: course.progressPercentage === 100 ? '#10b981' : '#3b82f6',
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {course.completedLessons} / {course.totalLessons} lessons
                            </Typography>
                          </Box>

                          {course.suggestedLesson && (
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                icon={<PlayArrow />}
                                label="Next Lesson"
                                size="small"
                                color="primary"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2" noWrap>
                                {course.suggestedLesson.title}
                              </Typography>
                            </Box>
                          )}

                          {course.recentQuiz && (
                            <Box sx={{ mt: 2 }}>
                              <Divider sx={{ mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                Last Quiz: {course.recentQuiz.score}%{' '}
                                {course.recentQuiz.passed ? '✓' : '✗'}
                              </Typography>
                            </Box>
                          )}

                          {eligibility && eligibility.eligible && !eligibility.alreadyIssued && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                              <Typography variant="caption">
                                You're eligible for a certificate!
                              </Typography>
                            </Alert>
                          )}
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          {eligibility && eligibility.eligible && !eligibility.alreadyIssued ? (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<EmojiEvents />}
                              onClick={() => handleIssueCertificate(course.courseId)}
                              sx={{
                                backgroundColor: '#ffda1b',
                                color: '#232536',
                                '&:hover': {
                                  backgroundColor: '#232536',
                                  color: '#fff',
                                },
                              }}
                            >
                              Get Certificate
                            </Button>
                          ) : (
                            <Button
                              fullWidth
                              component={RouterLink}
                              to={`/courses/${course.courseId}`}
                              variant="contained"
                              sx={{
                                backgroundColor: '#232536',
                                '&:hover': {
                                  backgroundColor: '#ffda1b',
                                  color: '#232536',
                                },
                              }}
                            >
                              Continue Learning
                            </Button>
                          )}
                        </CardActions>
                      </StyledCard>
                    </Grid>
                  );
                })}
              </Grid>

              {dashboard?.recentQuizzes.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700, color: '#232536' }}>
                    Recent Quiz Attempts
                  </Typography>
                  <Grid container spacing={2}>
                    {dashboard.recentQuizzes.slice(0, 5).map((attempt) => (
                      <Grid item xs={12} key={attempt._id}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                                sx={{ fontWeight: 600 }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          )}
      </Container>
    </Box>
  );
};

export default StudentDashboard;

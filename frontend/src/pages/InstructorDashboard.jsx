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
  Alert,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { instructorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

const StatCard = styled(Card)(({ theme }) => ({
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

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await instructorAPI.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <LinearProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#232536', mb: 1 }}>
            Instructor Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage your courses and track student progress
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && stats ? (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2">Total Courses</Typography>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalEnrollments}
                  </Typography>
                  <Typography variant="body2">Total Students</Typography>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.activeEnrollments}
                  </Typography>
                  <Typography variant="body2">Active Students</Typography>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalLessons}
                  </Typography>
                  <Typography variant="body2">Total Lessons</Typography>
                </StatCard>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700, color: '#232536' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Course Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Create and manage your courses, modules, and lessons
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={`${stats.publishedCourses} Published`}
                        size="small"
                        sx={{ bgcolor: '#10b981', color: '#fff' }}
                      />
                      <Chip
                        label={`${stats.totalCourses - stats.publishedCourses} Drafts`}
                        size="small"
                        sx={{ bgcolor: '#64748b', color: '#fff' }}
                      />
                      <Chip
                        label={`${stats.totalQuizzes} Quizzes`}
                        size="small"
                        sx={{ bgcolor: '#8b5cf6', color: '#fff' }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/instructor/courses')}
                      sx={{
                        backgroundColor: '#232536',
                        '&:hover': {
                          backgroundColor: '#ffda1b',
                          color: '#232536',
                        },
                      }}
                    >
                      Manage Courses
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Student Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Track student progress and engagement across your courses
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={`${stats.activeEnrollments} Active`}
                        size="small"
                        sx={{ bgcolor: '#10b981', color: '#fff' }}
                      />
                      <Chip
                        label={`${stats.completedEnrollments} Completed`}
                        size="small"
                        sx={{ bgcolor: '#3b82f6', color: '#fff' }}
                      />
                      <Chip
                        label={`${stats.recentEnrollments} This Week`}
                        size="small"
                        sx={{ bgcolor: '#f59e0b', color: '#fff' }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/instructor/courses')}
                      sx={{
                        backgroundColor: '#232536',
                        '&:hover': {
                          backgroundColor: '#ffda1b',
                          color: '#232536',
                        },
                      }}
                    >
                      View Students
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Create New Course
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start building a new course with modules and lessons
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <SchoolIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/instructor/courses')}
                      sx={{
                        backgroundColor: '#ffda1b',
                        color: '#232536',
                        '&:hover': {
                          backgroundColor: '#232536',
                          color: '#fff',
                        },
                      }}
                    >
                      Create Course
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            </Grid>
          </>
        ) : !error && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            No data available yet.{' '}
            <RouterLink to="/instructor/courses" style={{ color: '#667eea', fontWeight: 600 }}>
              Create your first course
            </RouterLink>
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default InstructorDashboard;

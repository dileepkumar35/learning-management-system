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
  background: '#2c3e50',
  border: 'none',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const StatCard = styled(Card)(({ bgcolor }) => ({
  background: bgcolor || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  border: 'none',
  borderRadius: 12,
  height: '100%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
        <Container maxWidth="xl">
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#ffda1b' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#ffda1b',
              mb: 1,
            }}
          >
            Instructor Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Welcome back, Instructor!
          </Typography>
        </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {!loading && stats ? (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={6} md={3}>
              <StatCard bgcolor="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <SchoolIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Courses
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <StatCard bgcolor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <PeopleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                    {stats.totalEnrollments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Students
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <StatCard bgcolor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                    {stats.activeEnrollments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Active Students
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <StatCard bgcolor="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                    {stats.totalLessons}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Lessons
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                    Course Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                    Create and manage your courses, modules, and lessons
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${stats.publishedCourses} Published`}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                      }}
                    />
                    <Chip
                      label={`${stats.totalCourses - stats.publishedCourses} Drafts`}
                      sx={{
                        background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                        color: '#fff',
                      }}
                    />
                    <Chip
                      label={`${stats.totalQuizzes} Quizzes`}
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: '#fff',
                      }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate('/instructor/courses')}
                    sx={{
                      backgroundColor: '#ffda1b',
                      color: '#232536',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      '&:hover': {
                        backgroundColor: '#ffc107',
                      },
                    }}
                  >
                    Manage Courses
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                    Student Engagement
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                    Track student progress and engagement across your courses
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${stats.activeEnrollments} Active`}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                      }}
                    />
                    <Chip
                      label={`${stats.completedEnrollments} Completed`}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                      }}
                    />
                    <Chip
                      label={`${stats.recentEnrollments} This Week`}
                      sx={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#fff',
                      }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/instructor/courses')}
                    sx={{
                      borderColor: '#ffda1b',
                      color: '#ffda1b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      '&:hover': {
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 218, 27, 0.1)',
                      },
                    }}
                  >
                    View Students
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          </Grid>
        </>
      ) : !error && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            background: '#fff',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <SchoolIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
            No data available
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Start by creating your first course
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/instructor/courses')}
            sx={{
              backgroundColor: '#ffda1b',
              color: '#232536',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#ffc107',
              },
            }}
          >
            Go to Courses
          </Button>
        </Box>
      )}
      </Container>
    </Box>
  );
};

export default InstructorDashboard;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  CheckCircle,
  EmojiEvents,
  Timer,
  Assignment,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { progressAPI, enrollmentsAPI } from '../services/api';

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

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  minHeight: '160px',
  height: '100%',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '200px',
  margin: '0 auto',
}));

const Progress = () => {
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get dashboard data
      const dashboardResponse = await progressAPI.getDashboard();
      const enrollmentsResponse = await enrollmentsAPI.getMyEnrollments();

      // Process the data
      const courses = dashboardResponse.data.courses || [];
      const allEnrollments = enrollmentsResponse.data || [];

      // Calculate statistics
      const totalEnrollments = courses.length;
      const completedCourses = courses.filter(c => c.progressPercentage === 100).length;
      const inProgressCourses = courses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100).length;
      const notStartedCourses = courses.filter(c => c.progressPercentage === 0).length;

      const totalLessons = courses.reduce((sum, c) => sum + c.totalLessons, 0);
      const completedLessons = courses.reduce((sum, c) => sum + c.completedLessons, 0);

      setStats({
        totalEnrollments,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        totalLessons,
        completedLessons,
        byStatus: {
          active: inProgressCourses,
          completed: completedCourses,
          paused: 0,
          dropped: notStartedCourses,
        },
      });

      setEnrollments(courses.map(course => ({
        ...course,
        course: { title: course.courseTitle },
        completedLessons: Array(course.completedLessons).fill({}),
        progress: course.progressPercentage,
      })));
    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  // Prepare chart data
  const statusData = [
    { name: 'Active', value: stats?.byStatus?.active || 0, color: '#3b82f6' },
    { name: 'Completed', value: stats?.byStatus?.completed || 0, color: '#10b981' },
    { name: 'Not Started', value: stats?.byStatus?.dropped || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const progressData = enrollments
    .filter(enrollment => enrollment.course)
    .slice(0, 5)
    .map(enrollment => ({
      name: (enrollment.course?.title || 'Unknown Course').substring(0, 20),
      progress: enrollment.progress || 0,
      completed: enrollment.completedLessons?.length || 0,
      total: enrollment.totalLessons || 0,
    }));

  const totalLessons = enrollments.reduce((sum, e) => sum + (e.totalLessons || 0), 0);
  const completedLessons = enrollments.reduce((sum, e) => sum + (e.completedLessons?.length || 0), 0);
  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#232536', mb: 1 }}>
            My Learning Progress
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Track your learning journey and achievements
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Assignment sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.totalEnrollments || 0}
              </Typography>
              <Typography variant="body2">Total Courses</Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.completedCourses || 0}
              </Typography>
              <Typography variant="body2">Completed</Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <TrendingUp sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                {averageProgress}%
              </Typography>
              <Typography variant="body2">Avg. Progress</Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <EmojiEvents sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                {completedLessons}
              </Typography>
              <Typography variant="body2">Lessons Done</Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Course Status Distribution */}
          {statusData.length > 0 && (
            <Grid item xs={12} sm={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Course Status Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          )}

          {/* Course Progress Bar Chart */}
          {progressData.length > 0 && (
            <Grid item xs={12} sm={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Course Progress Overview
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="progress" fill="#3b82f6" name="Progress %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          )}
        </Grid>

        {/* Detailed Course Progress */}
        <StyledCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Detailed Course Progress
            </Typography>

            {enrollments.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No courses enrolled yet. Start learning to see your progress here!
              </Alert>
            ) : (
              <Box>
                {enrollments.map((enrollment, index) => (
                  <Box key={index}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {enrollment.course?.title || 'Unknown Course'}
                        </Typography>
                        <Chip
                          label={`${enrollment.progress}%`}
                          color={enrollment.progress === 100 ? 'success' : enrollment.progress > 0 ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={enrollment.progress}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: enrollment.progress === 100 ? '#10b981' : '#3b82f6',
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {enrollment.completedLessons?.length || 0} of {enrollment.totalLessons || 0} lessons completed
                        </Typography>
                        {enrollment.progress === 100 && (
                          <Chip
                            icon={<EmojiEvents />}
                            label="Completed!"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    {index < enrollments.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
};

export default Progress;

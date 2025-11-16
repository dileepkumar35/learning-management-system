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
  Alert,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { School, Person, MenuBook } from '@mui/icons-material';
import { coursesAPI } from '../services/api';
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
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const CoursesList = () => {
  const { isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#232536', mb: 1 }}>
                Available Courses
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Explore and enroll in courses to start learning
              </Typography>
            </Box>
            {isInstructor && (
              <Button
                component={RouterLink}
                to="/instructor/courses/new"
                variant="contained"
                sx={{
                  backgroundColor: '#ffda1b',
                  color: '#232536',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#ffc107',
                  },
                }}
              >
                Create Course
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {courses.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No courses available yet.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => {
              const totalModules = course.modules?.length || 0;
              const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
              
              return (
                <Grid item xs={12} sm={6} md={6} key={course._id}>
                  <StyledCard>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <School sx={{ fontSize: 40, color: '#3b82f6', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }} noWrap>
                          {course.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: '60px' }}>
                        {course.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ fontSize: 18, color: '#64748b', mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {course.instructor?.name || 'Unknown Instructor'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<MenuBook sx={{ fontSize: 16 }} />}
                          label={`${totalModules} ${totalModules === 1 ? 'module' : 'modules'}`}
                          size="small"
                          sx={{
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={`${totalLessons} ${totalLessons === 1 ? 'lesson' : 'lessons'}`}
                          size="small"
                          sx={{
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        component={RouterLink}
                        to={`/courses/${course._id}`}
                        variant="contained"
                        sx={{
                          backgroundColor: '#232536',
                          color: '#fff',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#ffda1b',
                            color: '#232536',
                          },
                        }}
                      >
                        View Course
                      </Button>
                    </CardActions>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CoursesList;

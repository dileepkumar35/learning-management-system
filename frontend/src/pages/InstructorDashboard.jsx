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
} from '@mui/material';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      // Filter courses by instructor
      const myCourses = response.data.filter(
        (course) => course.instructor._id === user.id
      );
      setCourses(myCourses);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
          <Typography variant="h4">
            Instructor Dashboard
          </Typography>
          <Button
            component={RouterLink}
            to="/instructor/courses/new"
            variant="contained"
            color="primary"
          >
            Create New Course
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {courses.length === 0 ? (
          <Alert severity="info">
            You haven't created any courses yet.
          </Alert>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              My Courses
            </Typography>
            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {course.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.modules?.length || 0} modules
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {course.isPublished ? 'Published' : 'Draft'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        component={RouterLink}
                        to={`/instructor/courses/${course._id}`}
                        size="small"
                        color="primary"
                      >
                        Manage
                      </Button>
                      <Button
                        component={RouterLink}
                        to={`/courses/${course._id}`}
                        size="small"
                      >
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default InstructorDashboard;

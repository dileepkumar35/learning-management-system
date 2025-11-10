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
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
      <Container>
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Available Courses
          </Typography>
          {isInstructor && (
            <Button
              component={RouterLink}
              to="/instructor/courses/new"
              variant="contained"
              color="primary"
            >
              Create Course
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {courses.length === 0 ? (
          <Alert severity="info">
            No courses available yet.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {course.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instructor: {course.instructor?.name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${course.modules?.length || 0} modules`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0} lessons`}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/courses/${course._id}`}
                      size="small"
                      color="primary"
                    >
                      View Course
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default CoursesList;

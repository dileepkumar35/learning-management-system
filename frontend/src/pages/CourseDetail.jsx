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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { coursesAPI, enrollmentsAPI, progressAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourse();
    if (isAuthenticated) {
      checkEnrollment();
    }
  }, [id, isAuthenticated]);

  const loadCourse = async () => {
    try {
      const response = await coursesAPI.getById(id);
      setCourse(response.data);
    } catch (err) {
      setError('Failed to load course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await enrollmentsAPI.checkEnrollment(id);
      setEnrolled(response.data.enrolled);
      if (response.data.enrolled) {
        loadProgress();
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await progressAPI.getCourseProgress(id);
      setProgress(response.data);
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await enrollmentsAPI.enroll(id);
      setEnrolled(true);
      loadProgress();
    } catch (err) {
      setError('Failed to enroll in course');
      console.error(err);
    }
  };

  const isLessonComplete = (lessonId) => {
    return progress?.progressRecords?.some(
      (p) => p.lesson.toString() === lessonId && p.completed
    );
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

  if (error || !course) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Course not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Instructor: {course.instructor?.name}
            </Typography>
            {enrolled && progress && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Your Progress: {progress.completedLessons} / {progress.totalLessons} lessons
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress.progressPercentage}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {progress.progressPercentage}%
                </Typography>
              </Box>
            )}
            {!enrolled && isStudent && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnroll}
                sx={{ mt: 2 }}
              >
                Enroll in Course
              </Button>
            )}
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom>
          Course Content
        </Typography>

        {course.modules?.map((module, moduleIndex) => (
          <Accordion key={module._id} defaultExpanded={moduleIndex === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {module.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {module.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {module.description}
                </Typography>
              )}
              <List>
                {module.lessons?.map((lesson) => (
                  <Box key={lesson._id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => enrolled && navigate(`/lessons/${lesson._id}`)}
                        disabled={!enrolled}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {enrolled && isLessonComplete(lesson._id) ? (
                            <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                          ) : (
                            <PlayArrowIcon sx={{ mr: 2 }} />
                          )}
                          <ListItemText
                            primary={lesson.title}
                            secondary={lesson.description}
                          />
                          {lesson.quiz && (
                            <Chip label="Quiz" size="small" color="primary" />
                          )}
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        {course.modules?.length === 0 && (
          <Alert severity="info">
            This course doesn't have any modules yet.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default CourseDetail;

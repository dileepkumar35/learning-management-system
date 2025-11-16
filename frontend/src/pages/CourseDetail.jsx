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
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Course not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Card sx={{ mb: 3, borderRadius: { xs: 2, sm: 3 }, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              {course.title}
            </Typography>
            <Typography variant="body1" paragraph sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {course.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Instructor: {course.instructor?.name}
            </Typography>
            {enrolled && progress && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Your Progress: {progress.completedLessons} / {progress.totalLessons} lessons
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress.progressPercentage}
                  sx={{ height: { xs: 6, sm: 8 }, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {progress.progressPercentage}%
                </Typography>
              </Box>
            )}
            {!enrolled && isStudent && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnroll}
                sx={{ 
                  mt: 2,
                  py: { xs: 1, sm: 1.2 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 600,
                }}
              >
                Enroll in Course
              </Button>
            )}
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600 }}>
          Course Content
        </Typography>

        {course.modules?.map((module, moduleIndex) => (
          <Accordion 
            key={module._id} 
            defaultExpanded={moduleIndex === 0}
            sx={{
              mb: { xs: 1.5, sm: 2 },
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ py: { xs: 1.5, sm: 2 } }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                {module.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              {module.description && (
                <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {module.description}
                </Typography>
              )}
              <List sx={{ p: 0 }}>
                {module.lessons?.map((lesson) => (
                  <Box key={lesson._id}>
                    <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 0.75 } }}>
                      <ListItemButton
                        onClick={() => enrolled && navigate(`/lessons/${lesson._id}`)}
                        disabled={!enrolled}
                        sx={{ 
                          borderRadius: 1,
                          py: { xs: 1, sm: 1.25 },
                          px: { xs: 1.5, sm: 2 },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {enrolled && isLessonComplete(lesson._id) ? (
                            <CheckCircleIcon color="success" sx={{ mr: 2, flexShrink: 0, fontSize: { xs: 20, sm: 22, md: 24 } }} />
                          ) : (
                            <PlayArrowIcon sx={{ mr: 2, flexShrink: 0, fontSize: { xs: 20, sm: 22, md: 24 } }} />
                          )}
                          <ListItemText
                            primary={lesson.title}
                            secondary={lesson.description}
                            primaryTypographyProps={{
                              sx: { fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }
                            }}
                            secondaryTypographyProps={{
                              sx: { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                            }}
                          />
                          {lesson.quiz && (
                            <Chip 
                              label="Quiz" 
                              size="small" 
                              color="primary" 
                              sx={{ 
                                ml: 1,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: 20, sm: 24 },
                              }} 
                            />
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
          <Alert severity="info" sx={{ borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            This course doesn't have any modules yet.
          </Alert>
        )}
      </Box>
      </Container>
    </Box>
  );
};

export default CourseDetail;

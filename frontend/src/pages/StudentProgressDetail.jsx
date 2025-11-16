import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { instructorAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
  border: '1px solid rgba(255, 218, 27, 0.1)',
  transition: 'all 0.3s ease',
}));

const StatCard = styled(Card)(({ bgcolor }) => ({
  background: bgcolor || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  border: 'none',
  height: '100%',
  minHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '220px',
  margin: '0 auto',
}));

const ModuleCard = styled(Accordion)(({ theme }) => ({
  background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
  border: '1px solid rgba(255, 218, 27, 0.1)',
  marginBottom: theme.spacing(2),
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(2)} 0`,
  },
}));

const StudentProgressDetail = () => {
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStudentProgress();
  }, [courseId, studentId]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getStudentProgress(courseId, studentId);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#ffda1b' }} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ color: '#94a3b8' }}>
          No data available
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/instructor/courses/${courseId}/students`)}
          sx={{
            color: '#ffda1b',
            mb: 2,
            '&:hover': {
              background: 'rgba(255, 218, 27, 0.1)',
            },
          }}
        >
          Back to Students
        </Button>

        {/* Student Header */}
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #ffda1b 0%, #ffc107 100%)',
                    color: '#232536',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  {data.student.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                  {data.student.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 1 }}>
                  {data.student.email}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Enrolled on {new Date(data.enrollment.enrolledAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item>
                <Chip
                  label={data.enrollment.status}
                  sx={{
                    background:
                      data.enrollment.status === 'active'
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Course Info */}
        <Typography
          variant="h5"
          sx={{
            color: '#fff',
            fontWeight: 600,
            mb: 1,
          }}
        >
          {data.course.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
          {data.course.description}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                      {data.summary.overallProgress}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Overall Progress
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                      {data.summary.completedLessons}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      of {data.summary.totalLessons} Lessons
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                      {data.summary.totalQuizAttempts}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Quiz Attempts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                      {data.summary.avgQuizScore}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Avg Quiz Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Module Progress */}
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
          Detailed Progress
        </Typography>

        {data.modules.map((module) => (
          <ModuleCard key={module.moduleId}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#ffda1b' }} />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2,
                },
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                  {module.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, maxWidth: 300 }}>
                    <LinearProgress
                      variant="determinate"
                      value={module.progressPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#94a3b8', minWidth: 80 }}>
                    {module.completedLessons} / {module.totalLessons} Lessons
                  </Typography>
                  <Chip
                    size="small"
                    label={`${module.progressPercentage}%`}
                    sx={{
                      background:
                        module.progressPercentage === 100
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ width: '100%' }}>
                {module.lessons.map((lesson, index) => (
                  <Box key={lesson.lessonId}>
                    {index > 0 && <Divider sx={{ borderColor: 'rgba(255, 218, 27, 0.1)', my: 1 }} />}
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {lesson.completed ? (
                          <CheckCircleIcon sx={{ color: '#10b981' }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ color: '#64748b' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ color: lesson.completed ? '#fff' : '#94a3b8' }}>
                            {lesson.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {lesson.completed && lesson.completedAt && (
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                Completed on {new Date(lesson.completedAt).toLocaleDateString()}
                              </Typography>
                            )}
                            {lesson.hasQuiz && lesson.quizAttempts.length > 0 && (
                              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {lesson.quizAttempts.map((attempt, idx) => (
                                  <Chip
                                    key={attempt.attemptId}
                                    size="small"
                                    icon={<AssignmentIcon />}
                                    label={`Attempt ${idx + 1}: ${attempt.score}%`}
                                    sx={{
                                      background: attempt.passed
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                      color: '#fff',
                                      '& .MuiChip-icon': {
                                        color: '#fff',
                                      },
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </AccordionDetails>
          </ModuleCard>
        ))}
      </Box>
    </Container>
  );
};

export default StudentProgressDetail;

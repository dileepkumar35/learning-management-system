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
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#667eea' }} />
        </Container>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            No data available
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/instructor/courses/${courseId}/students`)}
          sx={{
            color: '#667eea',
            mb: 2,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            '&:hover': {
              background: 'rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          Back to Students
        </Button>

        {/* Student Header */}
        <StyledCard sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: { xs: 64, sm: 72, md: 80 },
                    height: { xs: 64, sm: 72, md: 80 },
                    background: 'linear-gradient(135deg, #ffda1b 0%, #ffc107 100%)',
                    color: '#232536',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    fontWeight: 700,
                  }}
                >
                  {data.student.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {data.student.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {data.student.email}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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
            color: '#1e293b',
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
          }}
        >
          {data.course.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {data.course.description}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard bgcolor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                      {data.summary.overallProgress}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Overall Progress
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard bgcolor="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                      {data.summary.completedLessons}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      of {data.summary.totalLessons} Lessons
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard bgcolor="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                      {data.summary.totalQuizAttempts}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Quiz Attempts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard bgcolor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <SchoolIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#fff', opacity: 0.8 }} />
                  <Box>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                      {data.summary.avgQuizScore}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Avg Quiz Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Module Progress */}
        <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 600, mb: 3, fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' } }}>
          Detailed Progress
        </Typography>

        {data.modules.map((module) => (
          <ModuleCard key={module.moduleId}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2,
                },
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 1, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                  {module.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ flexGrow: 1, maxWidth: { xs: 200, sm: 250, md: 300 } }}>
                    <LinearProgress
                      variant="determinate"
                      value={module.progressPercentage}
                      sx={{
                        height: { xs: 6, sm: 8 },
                        borderRadius: 4,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', minWidth: { xs: 70, sm: 80 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ width: '100%' }}>
                {module.lessons.map((lesson, index) => (
                  <Box key={lesson.lessonId}>
                    {index > 0 && <Divider sx={{ borderColor: '#e2e8f0', my: 1 }} />}
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {lesson.completed ? (
                          <CheckCircleIcon sx={{ color: '#10b981' }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ color: '#cbd5e1' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ color: lesson.completed ? '#1e293b' : '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {lesson.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {lesson.completed && lesson.completedAt && (
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                <AccessTimeIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
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
                                        ? '#d1fae5'
                                        : '#fee2e2',
                                      color: attempt.passed ? '#059669' : '#dc2626',
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      '& .MuiChip-icon': {
                                        color: attempt.passed ? '#059669' : '#dc2626',
                                        fontSize: { xs: 14, sm: 16 },
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
    </Box>
  );
};

export default StudentProgressDetail;

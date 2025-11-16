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
  IconButton,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { instructorAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  height: '100%',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    borderColor: '#cbd5e1',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  overflow: 'hidden',
  '& .MuiTableCell-root': {
    color: '#1e293b',
    borderBottom: '1px solid #e2e8f0',
    padding: theme.spacing(1.5),
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    background: '#f8fafc',
    color: '#334155',
  },
  '& tbody tr:hover': {
    background: '#f8fafc',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: '#e2e8f0',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
  },
}));

const StatChip = styled(Chip)(({ bgcolor }) => ({
  backgroundColor: bgcolor || '#10b981',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.875rem',
}));

const EnrolledStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchEnrolledStudents();
  }, [courseId]);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getEnrolledStudents(courseId);
      setCourseData(response.data.course);
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (studentId) => {
    navigate(`/instructor/courses/${courseId}/students/${studentId}`);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#3b82f6';
    if (percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'dropped':
        return '#64748b';
      default:
        return '#94a3b8';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#ffda1b' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/instructor/courses')}
          sx={{
            color: '#667eea',
            mb: 2,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            fontWeight: 500,
            '&:hover': {
              background: 'rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          Back to Courses
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          {courseData?.title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {courseData?.description}
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StyledCard>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', width: { xs: 48, sm: 52, md: 56 }, height: { xs: 48, sm: 52, md: 56 } }}>
                    <PersonIcon sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: '#fff' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                      {students.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Total Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StyledCard>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', width: { xs: 48, sm: 52, md: 56 }, height: { xs: 48, sm: 52, md: 56 } }}>
                    <CheckCircleIcon sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: '#fff' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                      {students.filter((s) => s.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Active Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StyledCard>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', width: { xs: 48, sm: 52, md: 56 }, height: { xs: 48, sm: 52, md: 56 } }}>
                    <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: '#fff' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                      {students.length > 0
                        ? Math.round(
                            students.reduce((sum, s) => sum + (s.progress?.progressPercentage || 0), 0) / students.length
                          )
                        : 0}
                      %
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Avg Progress
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StyledCard>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #5568d3 100%)', width: { xs: 48, sm: 52, md: 56 }, height: { xs: 48, sm: 52, md: 56 } }}>
                    <AssignmentIcon sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: '#fff' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                      {students.length > 0
                        ? Math.round(
                            students.reduce((sum, s) => sum + (s.progress?.avgQuizScore || 0), 0) / students.length
                          )
                        : 0}
                      %
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Avg Quiz Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>

      {students.length === 0 ? (
        <StyledCard>
          <CardContent sx={{ textAlign: 'center', py: { xs: 6, sm: 7, md: 8 } }}>
            <PersonIcon sx={{ fontSize: { xs: 56, sm: 60, md: 64 }, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
              No students enrolled yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Students will appear here once they enroll in your course
            </Typography>
          </CardContent>
        </StyledCard>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Enrolled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Progress</TableCell>
                <TableCell align="center">Completed Lessons</TableCell>
                <TableCell align="center">Quiz Attempts</TableCell>
                <TableCell align="center">Avg Quiz Score</TableCell>
                <TableCell align="center">Last Activity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((studentData) => (
                <TableRow
                  key={studentData.enrollmentId}
                  sx={{
                    '&:hover': {
                      background: '#f8fafc',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #5568d3 100%)',
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      >
                        {studentData.student.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
                          {studentData.student.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {studentData.student.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {new Date(studentData.enrolledAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatChip
                      size="small"
                      label={studentData.status}
                      bgcolor={getStatusColor(studentData.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 600 }}>
                          {studentData.progress.progressPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={studentData.progress.progressPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${getProgressColor(
                              studentData.progress.progressPercentage
                            )} 0%, ${getProgressColor(studentData.progress.progressPercentage)}cc 100%)`,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                      {studentData.progress.completedLessons} / {studentData.progress.totalLessons}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                      {studentData.progress.totalQuizAttempts}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={`${studentData.progress.avgQuizScore}%`}
                      sx={{
                        background:
                          studentData.progress.avgQuizScore >= 70
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {new Date(studentData.progress.lastAccessed).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(studentData.student.id)}
                        sx={{
                          color: '#667eea',
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)',
                          },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </Container>
  );
};

export default EnrolledStudents;

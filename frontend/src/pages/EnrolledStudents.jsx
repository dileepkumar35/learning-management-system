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
  background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
  border: '1px solid rgba(255, 218, 27, 0.1)',
  transition: 'all 0.3s ease',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
  border: '1px solid rgba(255, 218, 27, 0.1)',
  '& .MuiTableCell-root': {
    color: '#fff',
    borderBottom: '1px solid rgba(255, 218, 27, 0.1)',
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    background: 'rgba(255, 218, 27, 0.05)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/instructor/courses')}
          sx={{
            color: '#ffda1b',
            mb: 2,
            '&:hover': {
              background: 'rgba(255, 218, 27, 0.1)',
            },
          }}
        >
          Back to Courses
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#fff',
            mb: 1,
            background: 'linear-gradient(135deg, #ffda1b 0%, #ffc107 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {courseData?.title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
          {courseData?.description}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', width: 56, height: 56 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      {students.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      Total Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', width: 56, height: 56 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      {students.filter((s) => s.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      Active Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', width: 56, height: 56 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      {students.length > 0
                        ? Math.round(
                            students.reduce((sum, s) => sum + (s.progress?.progressPercentage || 0), 0) / students.length
                          )
                        : 0}
                      %
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      Avg Progress
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', width: 56, height: 56 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      {students.length > 0
                        ? Math.round(
                            students.reduce((sum, s) => sum + (s.progress?.avgQuizScore || 0), 0) / students.length
                          )
                        : 0}
                      %
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
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
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
              No students enrolled yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
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
                      background: 'rgba(255, 218, 27, 0.05)',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #ffda1b 0%, #ffc107 100%)',
                          color: '#232536',
                          fontWeight: 600,
                        }}
                      >
                        {studentData.student.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
                          {studentData.student.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {studentData.student.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
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
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                          {studentData.progress.progressPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={studentData.progress.progressPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {studentData.progress.completedLessons} / {studentData.progress.totalLessons}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: '#fff' }}>
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
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {new Date(studentData.progress.lastAccessed).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(studentData.student.id)}
                        sx={{
                          color: '#ffda1b',
                          '&:hover': {
                            background: 'rgba(255, 218, 27, 0.1)',
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

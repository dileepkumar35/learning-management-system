import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { coursesAPI, instructorAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '480px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid #e2e8f0',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    borderColor: '#cbd5e1',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#ffffff',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #6a4199 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
  },
}));

const StatChip = styled(Chip)(({ bgcolor }) => ({
  backgroundColor: bgcolor || '#10b981',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.8rem',
  '& .MuiChip-icon': {
    color: '#fff',
    fontSize: '1rem',
  },
}));

const InstructorCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getMyCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load courses',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditMode(true);
      setSelectedCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail || '',
        isPublished: course.isPublished,
      });
    } else {
      setEditMode(false);
      setSelectedCourse(null);
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        isPublished: false,
      });
    }
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      isPublished: false,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.description) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'warning',
        });
        return;
      }

      if (editMode && selectedCourse) {
        await coursesAPI.update(selectedCourse._id, formData);
        setSnackbar({
          open: true,
          message: 'Course updated successfully',
          severity: 'success',
        });
      } else {
        await coursesAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Course created successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save course',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await coursesAPI.delete(selectedCourse._id);
      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete course',
        severity: 'error',
      });
    }
  };

  const handleMenuOpen = (event, course) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleViewStudents = (courseId) => {
    navigate(`/instructor/courses/${courseId}/students`);
    setMenuAnchor(null);
  };

  const handleManageCourse = (courseId) => {
    navigate(`/instructor/courses/${courseId}/manage`);
    setMenuAnchor(null);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#667eea' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 2 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                }}
              >
                My Courses
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Manage your courses, modules, and lessons
              </Typography>
            </Box>
            <StyledButton 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
            >
              Create Course
            </StyledButton>
          </Box>
        </Box>

      {courses.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, sm: 8, md: 10 },
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <SchoolIcon sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#1e293b', mb: 1, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
            No courses yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Click the "Create Course" button above to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {courses.map((course) => (
            <Grid item xs={12} sm={12} md={6} lg={4} key={course._id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                        mb: 1,
                        flexGrow: 1,
                        pr: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.125rem' },
                      }}
                    >
                      {course.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, course)}
                      sx={{ color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.6,
                      height: '72px',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    <StatChip
                      size="small"
                      icon={<CheckCircleIcon />}
                      label={course.isPublished ? 'Published' : 'Draft'}
                      bgcolor={course.isPublished ? '#10b981' : '#64748b'}
                    />
                    <StatChip
                      size="small"
                      icon={<PeopleIcon />}
                      label={`${course.stats?.totalEnrollments || 0} students`}
                      bgcolor="#3b82f6"
                    />
                  </Box>

                  {course.modules && course.modules.length > 0 && (
                    <Box sx={{ height: '140px', overflow: 'hidden' }}>
                      <Accordion
                        sx={{
                          background: '#f8fafc',
                          color: '#1e293b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px !important',
                          '&:before': { display: 'none' },
                          boxShadow: 'none',
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}>
                          <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {course.modules.length} Module(s) • {course.stats?.totalLessons || 0} Lesson(s)
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ maxHeight: '90px', overflow: 'auto' }}>
                          <List dense>
                            {course.modules.slice(0, 3).map((module) => (
                              <ListItem key={module._id} sx={{ px: 0 }}>
                                <ListItemText
                                  primary={module.title}
                                  secondary={`${module.lessons?.length || 0} lessons`}
                                  primaryTypographyProps={{
                                    sx: { color: '#1e293b', fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 500 },
                                  }}
                                  secondaryTypographyProps={{
                                    sx: { color: '#64748b', fontSize: { xs: '0.7rem', sm: '0.75rem' } },
                                  }}
                                />
                              </ListItem>
                            ))}
                            {course.modules.length > 3 && (
                              <Typography variant="caption" sx={{ color: '#64748b', pl: 2 }}>
                                +{course.modules.length - 3} more modules
                              </Typography>
                            )}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleManageCourse(course._id)}
                    sx={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      fontWeight: 600,
                      py: { xs: 1, sm: 1.2 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&:hover': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  >
                    Manage Content
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Course Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          },
        }}
      >
        <MenuItem onClick={() => handleViewStudents(selectedCourse?._id)} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
          <PeopleIcon sx={{ mr: 1, fontSize: 20, color: '#667eea' }} />
          View Students
        </MenuItem>
        <MenuItem onClick={() => handleManageCourse(selectedCourse?._id)} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
          <SchoolIcon sx={{ mr: 1, fontSize: 20, color: '#667eea' }} />
          Manage Content
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog(selectedCourse)} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
          <EditIcon sx={{ mr: 1, fontSize: 20, color: '#667eea' }} />
          Edit Course
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedCourse)} sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Course
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            color: '#1e293b',
            fontWeight: 600,
            borderBottom: '1px solid #e2e8f0',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          {editMode ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
          <TextField
            fullWidth
            label="Course Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': { color: '#64748b' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
            }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            required
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': { color: '#64748b' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
            }}
          />
          <TextField
            fullWidth
            label="Thumbnail URL (optional)"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            margin="normal"
            placeholder="https://example.com/image.jpg"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': { color: '#64748b' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
              '& .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 0.7 },
            }}
          />
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Status
            </Typography>
            <Button
              variant={formData.isPublished ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              sx={{
                borderColor: '#667eea',
                color: formData.isPublished ? '#ffffff' : '#667eea',
                background: formData.isPublished ? '#667eea' : 'transparent',
                minWidth: '120px',
                '&:hover': {
                  borderColor: '#5568d3',
                  background: formData.isPublished ? '#5568d3' : 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              {formData.isPublished ? 'Published' : 'Draft'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 2, borderTop: '1px solid #e2e8f0', gap: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              color: '#64748b',
              '&:hover': {
                background: '#f8fafc',
              },
            }}
          >
            Cancel
          </Button>
          <StyledButton onClick={handleSubmit}>
            {editMode ? 'Update Course' : 'Create Course'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #fecaca',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#ef4444', fontWeight: 600 }}>
          Delete Course
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#1e293b' }}>
            Are you sure you want to delete <strong>"{selectedCourse?.title}"</strong>?
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 2, fontSize: '0.875rem' }}>
            This will permanently delete all modules, lessons, and quizzes in this course. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              color: '#64748b',
              '&:hover': {
                background: '#f8fafc',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              background: '#ef4444',
              '&:hover': { background: '#dc2626' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            background: snackbar.severity === 'success' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : snackbar.severity === 'error'
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : snackbar.severity === 'warning'
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default InstructorCourses;

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
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
  border: '1px solid rgba(255, 218, 27, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 218, 27, 0.3)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffda1b 0%, #ffc107 100%)',
  color: '#232536',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(255, 218, 27, 0.4)',
  },
}));

const StatChip = styled(Chip)(({ bgcolor }) => ({
  backgroundColor: bgcolor || '#10b981',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.875rem',
  '& .MuiChip-icon': {
    color: '#fff',
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#ffda1b' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
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
            My Courses
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Manage your courses, modules, and lessons
          </Typography>
        </Box>
        <StyledButton 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
        >
          Create Course
        </StyledButton>
      </Box>

      {courses.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255, 218, 27, 0.1)',
          }}
        >
          <SchoolIcon sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
            No courses yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Click the "Create Course" button above to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#fff',
                        mb: 1,
                        flexGrow: 1,
                        pr: 1,
                      }}
                    >
                      {course.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, course)}
                      sx={{ color: '#94a3b8' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#94a3b8',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                    <Accordion
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffda1b' }} />}>
                        <Typography variant="body2" sx={{ color: '#ffda1b', fontWeight: 600 }}>
                          {course.modules.length} Module(s) • {course.stats?.totalLessons || 0} Lesson(s)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {course.modules.slice(0, 3).map((module) => (
                            <ListItem key={module._id} sx={{ px: 0 }}>
                              <ListItemText
                                primary={module.title}
                                secondary={`${module.lessons?.length || 0} lessons`}
                                primaryTypographyProps={{
                                  sx: { color: '#e2e8f0', fontSize: '0.875rem' },
                                }}
                                secondaryTypographyProps={{
                                  sx: { color: '#94a3b8', fontSize: '0.75rem' },
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
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleManageCourse(course._id)}
                    sx={{
                      borderColor: '#ffda1b',
                      color: '#ffda1b',
                      '&:hover': {
                        borderColor: '#ffc107',
                        background: 'rgba(255, 218, 27, 0.1)',
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
            background: '#232536',
            color: '#fff',
            border: '1px solid rgba(255, 218, 27, 0.2)',
          },
        }}
      >
        <MenuItem onClick={() => handleViewStudents(selectedCourse?._id)}>
          <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
          View Students
        </MenuItem>
        <MenuItem onClick={() => handleManageCourse(selectedCourse?._id)}>
          <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />
          Manage Content
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog(selectedCourse)}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Course
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedCourse)} sx={{ color: '#ef4444' }}>
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
        fullScreen={false}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
            color: '#fff',
            border: '1px solid rgba(255, 218, 27, 0.2)',
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid rgba(255, 218, 27, 0.1)',
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
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 218, 27, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 218, 27, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ffda1b' },
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
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 218, 27, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 218, 27, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ffda1b' },
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
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 218, 27, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 218, 27, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ffda1b' },
              '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 0.7 },
            }}
          />
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              Status
            </Typography>
            <Button
              variant={formData.isPublished ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              sx={{
                borderColor: '#ffda1b',
                color: formData.isPublished ? '#232536' : '#ffda1b',
                background: formData.isPublished ? '#ffda1b' : 'transparent',
                minWidth: '120px',
                '&:hover': {
                  borderColor: '#ffc107',
                  background: formData.isPublished ? '#ffc107' : 'rgba(255, 218, 27, 0.1)',
                },
              }}
            >
              {formData.isPublished ? 'Published' : 'Draft'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 2, borderTop: '1px solid rgba(255, 218, 27, 0.1)', gap: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              color: '#94a3b8',
              '&:hover': {
                background: 'rgba(148, 163, 184, 0.1)',
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
            background: 'linear-gradient(135deg, #232536 0%, #2d2f42 100%)',
            color: '#fff',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#ef4444', fontWeight: 600 }}>
          Delete Course
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#e2e8f0' }}>
            Are you sure you want to delete <strong>"{selectedCourse?.title}"</strong>?
          </Typography>
          <Typography sx={{ color: '#94a3b8', mt: 2, fontSize: '0.875rem' }}>
            This will permanently delete all modules, lessons, and quizzes in this course. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              color: '#94a3b8',
              '&:hover': {
                background: 'rgba(148, 163, 184, 0.1)',
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
  );
};

export default InstructorCourses;

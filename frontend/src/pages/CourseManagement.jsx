import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore,
  Add,
  Edit,
  Delete,
  ArrowBack,
  MenuBook,
  VideoLibrary,
  Assignment,
  DragIndicator,
} from '@mui/icons-material';
import { coursesAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  height: '100%',
  padding: theme.spacing(3),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    borderColor: '#cbd5e1',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  textAlign: 'center',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '180px',
  height: '100%',
  width: '100%',
}));

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Module Dialog
  const [moduleDialog, setModuleDialog] = useState({ open: false, mode: 'create', data: null });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: 1 });

  // Lesson Dialog
  const [lessonDialog, setLessonDialog] = useState({ open: false, mode: 'create', moduleId: null, data: null });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    order: 1,
  });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const courseResponse = await coursesAPI.getById(courseId);
      setCourse(courseResponse.data);
      
      // Modules are already included in the course response
      if (courseResponse.data.modules) {
        setModules(courseResponse.data.modules);
      }
    } catch (err) {
      setError('Failed to load course data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Module CRUD
  const handleOpenModuleDialog = (mode, module = null) => {
    setModuleDialog({ open: true, mode, data: module });
    if (module) {
      setModuleForm({
        title: module.title,
        description: module.description || '',
        order: module.order,
      });
    } else {
      setModuleForm({ title: '', description: '', order: modules.length + 1 });
    }
  };

  const handleCloseModuleDialog = () => {
    setModuleDialog({ open: false, mode: 'create', data: null });
    setModuleForm({ title: '', description: '', order: 1 });
  };

  const handleSaveModule = async () => {
    try {
      if (moduleDialog.mode === 'create') {
        await coursesAPI.createModule(courseId, moduleForm);
        setSnackbar({ open: true, message: 'Module created successfully!', severity: 'success' });
      } else {
        await coursesAPI.updateModule(moduleDialog.data._id, moduleForm);
        setSnackbar({ open: true, message: 'Module updated successfully!', severity: 'success' });
      }
      handleCloseModuleDialog();
      loadCourseData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save module', severity: 'error' });
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? All lessons in this module will also be deleted.')) {
      return;
    }
    try {
      await coursesAPI.deleteModule(moduleId);
      setSnackbar({ open: true, message: 'Module deleted successfully!', severity: 'success' });
      loadCourseData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete module', severity: 'error' });
      console.error(err);
    }
  };

  // Lesson CRUD
  const handleOpenLessonDialog = (mode, moduleId, lesson = null) => {
    setLessonDialog({ open: true, mode, moduleId, data: lesson });
    if (lesson) {
      setLessonForm({
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || 0,
        order: lesson.order,
      });
    } else {
      const currentModule = modules.find(m => m._id === moduleId);
      setLessonForm({
        title: '',
        content: '',
        videoUrl: '',
        duration: 0,
        order: currentModule?.lessons?.length + 1 || 1,
      });
    }
  };

  const handleCloseLessonDialog = () => {
    setLessonDialog({ open: false, mode: 'create', moduleId: null, data: null });
    setLessonForm({ title: '', content: '', videoUrl: '', duration: 0, order: 1 });
  };

  const handleSaveLesson = async () => {
    try {
      if (lessonDialog.mode === 'create') {
        await coursesAPI.createLesson(courseId, lessonDialog.moduleId, lessonForm);
        setSnackbar({ open: true, message: 'Lesson created successfully!', severity: 'success' });
      } else {
        await coursesAPI.updateLesson(courseId, lessonDialog.moduleId, lessonDialog.data._id, lessonForm);
        setSnackbar({ open: true, message: 'Lesson updated successfully!', severity: 'success' });
      }
      handleCloseLessonDialog();
      loadCourseData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save lesson', severity: 'error' });
      console.error(err);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    try {
      await coursesAPI.deleteLesson(courseId, moduleId, lessonId);
      setSnackbar({ open: true, message: 'Lesson deleted successfully!', severity: 'success' });
      loadCourseData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete lesson', severity: 'error' });
      console.error(err);
    }
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

  if (error || !course) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 4 }}>
            {error || 'Course not found'}
          </Alert>
        </Container>
      </Box>
    );
  }

  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const totalDuration = modules.reduce(
    (sum, m) => sum + (m.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0),
    0
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/instructor/courses')}
            sx={{
              color: '#1e293b',
              mb: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': { color: '#667eea', backgroundColor: '#f1f5f9' },
            }}
          >
            Back to Courses
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
            {course.title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Manage modules and lessons for this course
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)' }}>
              <MenuBook sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                {totalModules}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Modules</Typography>
            </StatCard>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <VideoLibrary sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                {totalLessons}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Lessons</Typography>
            </StatCard>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Assignment sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Total Duration</Typography>
            </StatCard>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <Assignment sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                {course.enrolledCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Students</Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* Create Module Button */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModuleDialog('create')}
            sx={{
              backgroundColor: '#667eea',
              color: '#ffffff',
              fontWeight: 600,
              py: { xs: 1, sm: 1.2 },
              px: { xs: 2.5, sm: 3 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                backgroundColor: '#5568d3',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            Add Module
          </Button>
        </Box>

        {/* Modules and Lessons */}
        {modules.length === 0 ? (
          <StyledCard>
            <CardContent sx={{ textAlign: 'center', py: { xs: 4, sm: 5, md: 6 } }}>
              <MenuBook sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 1, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
                No modules yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Click "Add Module" to create your first module
              </Typography>
            </CardContent>
          </StyledCard>
        ) : (
          <Box>
            {modules.map((module, index) => (
              <Accordion
                key={module._id}
                defaultExpanded={index === 0}
                sx={{
                  mb: { xs: 1.5, sm: 2, md: 2 },
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px !important',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#667eea' }} />}
                  sx={{
                    py: { xs: 1, sm: 1.2, md: 1.5 },
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: { xs: 1, sm: 2 } }}>
                    <DragIndicator sx={{ color: '#94a3b8', fontSize: { xs: 20, sm: 22, md: 24 } }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
                        Module {module.order}: {module.title}
                      </Typography>
                      {module.description && (
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {module.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={`${module.lessons?.length || 0} lessons`}
                      size="small"
                      sx={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModuleDialog('edit', module);
                      }}
                      sx={{ color: '#667eea', '&:hover': { backgroundColor: '#f1f5f9' } }}
                      title="Edit Module"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module._id);
                      }}
                      sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                      title="Delete Module"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenLessonDialog('create', module._id)}
                      sx={{
                        color: '#667eea',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75 },
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#f1f5f9',
                        },
                      }}
                    >
                      Add Lesson
                    </Button>
                  </Box>

                  {module.lessons && module.lessons.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <Box key={lesson._id}>
                          {lessonIndex > 0 && <Divider sx={{ borderColor: '#e2e8f0', my: { xs: 0.75, sm: 1 } }} />}
                          <ListItem
                            sx={{
                              backgroundColor: '#ffffff',
                              borderRadius: 1,
                              mb: { xs: 0.75, sm: 1 },
                              py: { xs: 1, sm: 1.25 },
                              border: '1px solid #e2e8f0',
                              '&:hover': {
                                backgroundColor: '#f8fafc',
                                borderColor: '#cbd5e1',
                              },
                            }}
                          >
                            <DragIndicator sx={{ color: '#94a3b8', mr: { xs: 1, sm: 2 }, fontSize: { xs: 20, sm: 22 } }} />
                            <ListItemText
                              primary={
                                <Typography sx={{ color: '#1e293b', fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' } }}>
                                  {lesson.order}. {lesson.title}
                                </Typography>
                              }
                              secondary={
                                <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                  {lesson.duration > 0 && (
                                    <Chip
                                      label={`${lesson.duration} min`}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.75rem',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                      }}
                                    />
                                  )}
                                  {lesson.videoUrl && (
                                    <Chip
                                      icon={<VideoLibrary sx={{ fontSize: 14 }} />}
                                      label="Video"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.75rem',
                                        backgroundColor: '#3b82f6',
                                        color: '#fff',
                                      }}
                                    />
                                  )}
                                  {lesson.hasQuiz && (
                                    <Chip
                                      icon={<Assignment sx={{ fontSize: 14 }} />}
                                      label="Quiz"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.75rem',
                                        backgroundColor: '#10b981',
                                        color: '#fff',
                                      }}
                                    />
                                  )}
                                </span>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleOpenLessonDialog('edit', module._id, lesson)}
                                sx={{ color: '#667eea', mr: 1, '&:hover': { backgroundColor: '#f1f5f9' } }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteLesson(module._id, lesson._id)}
                                sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        No lessons yet. Click "Add Lesson" to create one.
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Container>

      {/* Module Dialog */}
      <Dialog
        open={moduleDialog.open}
        onClose={handleCloseModuleDialog}
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
        <DialogTitle sx={{ color: '#1e293b', fontWeight: 600 }}>
          {moduleDialog.mode === 'create' ? 'Create Module' : 'Edit Module'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Module Title"
            value={moduleForm.title}
            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': { color: '#667eea' },
              },
            }}
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            value={moduleForm.description}
            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': { color: '#667eea' },
              },
            }}
          />
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={moduleForm.order}
            onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': { color: '#667eea' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModuleDialog} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveModule}
            variant="contained"
            disabled={!moduleForm.title}
            sx={{
              backgroundColor: '#667eea',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#5568d3' },
              '&:disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            {moduleDialog.mode === 'create' ? 'Create Module' : 'Update Module'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog
        open={lessonDialog.open}
        onClose={handleCloseLessonDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#1e293b', fontWeight: 600 }}>
          {lessonDialog.mode === 'create' ? 'Create Lesson' : 'Edit Lesson'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Lesson Title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': { color: '#667eea' },
              },
            }}
          />
          <TextField
            fullWidth
            label="Content (Markdown supported)"
            multiline
            rows={6}
            value={lessonForm.content}
            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
            placeholder="Enter lesson content in Markdown format..."
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': { color: '#667eea' },
              },
            }}
          />
          <TextField
            fullWidth
            label="Video URL (Optional)"
            value={lessonForm.videoUrl}
            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': { color: '#667eea' },
              },
            }}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#1e293b',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b',
                    '&.Mui-focused': { color: '#667eea' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Order"
                type="number"
                value={lessonForm.order}
                onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#1e293b',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b',
                    '&.Mui-focused': { color: '#667eea' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseLessonDialog} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveLesson}
            variant="contained"
            disabled={!lessonForm.title}
            sx={{
              backgroundColor: '#667eea',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#5568d3' },
              '&:disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            {lessonDialog.mode === 'create' ? 'Create Lesson' : 'Update Lesson'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            background:
              snackbar.severity === 'success'
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
    </Box>
  );
};

export default CourseManagement;

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
  borderRadius: 12,
  height: '100%',
  padding: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  textAlign: 'center',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '160px',
  height: '100%',
  width: '100%',
  maxWidth: '200px',
  margin: '0 auto',
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
        await coursesAPI.updateModule(courseId, moduleDialog.data._id, moduleForm);
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
      await coursesAPI.deleteModule(courseId, moduleId);
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
      <Box sx={{ minHeight: '100vh', backgroundColor: '#232536' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#ffda1b' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#232536' }}>
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#232536' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/instructor/courses')}
            sx={{
              color: '#fff',
              mb: 2,
              '&:hover': { color: '#ffda1b' },
            }}
          >
            Back to Courses
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
            {course.title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Manage modules and lessons for this course
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <MenuBook sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {totalModules}
              </Typography>
              <Typography variant="body2">Modules</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <VideoLibrary sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {totalLessons}
              </Typography>
              <Typography variant="body2">Lessons</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </Typography>
              <Typography variant="body2">Total Duration</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {course.enrolledCount || 0}
              </Typography>
              <Typography variant="body2">Students</Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* Create Module Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModuleDialog('create')}
            sx={{
              backgroundColor: '#ffda1b',
              color: '#232536',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#fff',
              },
            }}
          >
            Add Module
          </Button>
        </Box>

        {/* Modules and Lessons */}
        {modules.length === 0 ? (
          <StyledCard sx={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <MenuBook sx={{ fontSize: 80, color: '#64748b', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#cbd5e1', mb: 1 }}>
                No modules yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
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
                  mb: 2,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#ffda1b' }} />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
                    <DragIndicator sx={{ color: '#64748b' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        Module {module.order}: {module.title}
                      </Typography>
                      {module.description && (
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          {module.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={`${module.lessons?.length || 0} lessons`}
                      size="small"
                      sx={{
                        backgroundColor: '#334155',
                        color: '#cbd5e1',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModuleDialog('edit', module);
                      }}
                      sx={{ color: '#ffda1b' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module._id);
                      }}
                      sx={{ color: '#ef4444' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#0f172a' }}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenLessonDialog('create', module._id)}
                      sx={{
                        color: '#ffda1b',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 218, 27, 0.1)',
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
                          {lessonIndex > 0 && <Divider sx={{ borderColor: '#334155', my: 1 }} />}
                          <ListItem
                            sx={{
                              backgroundColor: '#1e293b',
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': {
                                backgroundColor: '#334155',
                              },
                            }}
                          >
                            <DragIndicator sx={{ color: '#64748b', mr: 2 }} />
                            <ListItemText
                              primary={
                                <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                  {lesson.order}. {lesson.title}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                  {lesson.duration > 0 && (
                                    <Chip
                                      label={`${lesson.duration} min`}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.75rem',
                                        backgroundColor: '#334155',
                                        color: '#cbd5e1',
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
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleOpenLessonDialog('edit', module._id, lesson)}
                                sx={{ color: '#ffda1b', mr: 1 }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteLesson(module._id, lesson._id)}
                                sx={{ color: '#ef4444' }}
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
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
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
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 600 }}>
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
                color: '#fff',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#ffda1b' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
                '&.Mui-focused': { color: '#ffda1b' },
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
                color: '#fff',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#ffda1b' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
                '&.Mui-focused': { color: '#ffda1b' },
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
                color: '#fff',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#ffda1b' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
                '&.Mui-focused': { color: '#ffda1b' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModuleDialog} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveModule}
            variant="contained"
            disabled={!moduleForm.title}
            sx={{
              backgroundColor: '#ffda1b',
              color: '#232536',
              '&:hover': { backgroundColor: '#fff' },
              '&:disabled': { backgroundColor: '#334155', color: '#64748b' },
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
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 600 }}>
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
                color: '#fff',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#ffda1b' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
                '&.Mui-focused': { color: '#ffda1b' },
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
                color: '#fff',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#ffda1b' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
                '&.Mui-focused': { color: '#ffda1b' },
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
                color: '#fff',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#ffda1b' },
                '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
                '&.Mui-focused': { color: '#ffda1b' },
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
                    color: '#fff',
                    '& fieldset': { borderColor: '#334155' },
                    '&:hover fieldset': { borderColor: '#ffda1b' },
                    '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                    '&.Mui-focused': { color: '#ffda1b' },
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
                    color: '#fff',
                    '& fieldset': { borderColor: '#334155' },
                    '&:hover fieldset': { borderColor: '#ffda1b' },
                    '&.Mui-focused fieldset': { borderColor: '#ffda1b' },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                    '&.Mui-focused': { color: '#ffda1b' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseLessonDialog} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveLesson}
            variant="contained"
            disabled={!lessonForm.title}
            sx={{
              backgroundColor: '#ffda1b',
              color: '#232536',
              '&:hover': { backgroundColor: '#fff' },
              '&:disabled': { backgroundColor: '#334155', color: '#64748b' },
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

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  createModule: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  updateModule: (moduleId, data) => api.put(`/courses/modules/${moduleId}`, data),
  deleteModule: (moduleId) => api.delete(`/courses/modules/${moduleId}`),
  createLesson: (courseId, moduleId, data) => api.post(`/courses/modules/${moduleId}/lessons`, data),
  updateLesson: (courseId, moduleId, lessonId, data) => api.put(`/courses/lessons/${lessonId}`, data),
  deleteLesson: (courseId, moduleId, lessonId) => api.delete(`/courses/lessons/${lessonId}`),
  getLesson: (lessonId) => api.get(`/courses/lessons/${lessonId}`),
};

// Enrollments API
export const enrollmentsAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
  checkEnrollment: (courseId) => api.get(`/enrollments/check/${courseId}`),
  unenroll: (courseId) => api.delete(`/enrollments/${courseId}`),
};

// Progress API
export const progressAPI = {
  markComplete: (lessonId, courseId) => api.post('/progress/complete', { lessonId, courseId }),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  getDashboard: () => api.get('/progress/dashboard'),
};

// Quizzes API
export const quizzesAPI = {
  create: (data) => api.post('/quizzes', data),
  getById: (quizId) => api.get(`/quizzes/${quizId}`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  getAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),
  update: (quizId, data) => api.put(`/quizzes/${quizId}`, data),
  delete: (quizId) => api.delete(`/quizzes/${quizId}`),
};

// Certificates API
export const certificatesAPI = {
  issue: (courseId) => api.post('/certificates/issue', { courseId }),
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  getById: (certificateId) => api.get(`/certificates/${certificateId}`),
  verify: (verificationCode) => api.post('/certificates/verify', { verificationCode }),
  checkEligibility: (courseId) => api.get(`/certificates/check/${courseId}`),
  downloadPDF: (certificateId) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/certificates/download/${certificateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Instructor API
export const instructorAPI = {
  getMyCourses: () => api.get('/instructor/my-courses'),
  getDashboardStats: () => api.get('/instructor/dashboard/stats'),
  getEnrolledStudents: (courseId) => api.get(`/instructor/courses/${courseId}/students`),
  getStudentProgress: (courseId, studentId) => api.get(`/instructor/courses/${courseId}/students/${studentId}/progress`),
};

export default api;

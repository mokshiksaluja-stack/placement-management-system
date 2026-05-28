import axios from 'axios';

const API = axios.create({ 
  baseURL: "https://applywise-3dp9.onrender.com/api"
});
// Attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response Interceptor for Global Error Handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      // Network Error / Backend unreachable
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: { message: 'Server unreachable. Please check your connection.', type: 'error' } 
      }));
    } else {
      switch (response.status) {
        case 401:
          // True unauthorized - token expired or missing. Clear session and redirect.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('studentId');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          window.dispatchEvent(new CustomEvent('api-error', { 
            detail: { message: 'Access denied. You do not have permission for this action.', type: 'warning' } 
          }));
          break;
        case 500:
          // Do NOT wipe session on 500s - backend errors should not log out users.
          // CastErrors caused by bad IDs are now handled at the backend (returns [] or 404).
          console.warn('[API 500]', response.data?.message || response.data?.error || 'Server error');
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginAPI  = (data) => API.post('/auth/login', data);
export const signupAPI = (data) => API.post('/auth/signup', data);

// ── Jobs / Opportunities ──────────────────────────────────────────────────
export const fetchOpportunities    = ()       => API.get('/jobs');
export const fetchCoordinatorOpportunities = (coordinatorId) => API.get(`/jobs/coordinator/${coordinatorId}`);
export const fetchOpportunityById  = (id)     => API.get(`/jobs/${id}`);
export const createOpportunityApi  = (data)   => API.post('/opportunities', data);
export const updateOpportunityApi  = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteOpportunityApi  = (id)     => API.delete(`/jobs/${id}`);
export const assignCoordinatorApi  = (id, coordinatorId, coordinatorName) =>
  API.put(`/jobs/${id}/assign-coordinator`, { coordinatorId, coordinatorName });

// ── Applications ──────────────────────────────────────────────────────────
export const fetchApplications     = (filters = {}) => API.get('/applications', { params: filters });
export const fetchStudentApplications = (studentId) => API.get(`/applications/student/${studentId}`);
export const fetchOpportunityApplications = (jobId) => API.get(`/applications/opportunity/${jobId}`);
export const fetchCoordinatorApplicationsApi = (coordinatorId) => API.get(`/applications/coordinator/${coordinatorId}`);
export const fetchApplicationById  = (id)     => API.get(`/applications/${id}`);
export const createApplicationApi  = (data)   => API.post('/applications', data);
export const updateApplicationApi  = (id, data) => API.put(`/applications/${id}`, data);

// Granular coordinator action endpoints
export const updateAppStatusApi    = (id, payload) => API.put(`/applications/${id}/status`, payload);
export const scheduleInterviewApi  = (id, payload) => API.put(`/applications/${id}/schedule`, payload);
export const markAttendanceApi     = (id, attendance) => API.put(`/applications/${id}/attendance`, { attendance });
export const advanceRoundApi       = (id, payload) => API.put(`/applications/${id}/round`, payload);

// ── Students ──────────────────────────────────────────────────────────────
export const fetchStudents = () => API.get('/students');

// ── Interviews ────────────────────────────────────────────────────────────
export const fetchInterviews = () => API.get('/interviews');

// ── Notifications ─────────────────────────────────────────────────────────
export const fetchNotificationsApi  = (receiverId) =>
  API.get('/notifications', { params: { receiverId } });
export const createNotificationApi  = (payload) => API.post('/notifications', payload);
export const markNotifReadApi       = (id)       => API.put(`/notifications/${id}/read`);

// ── Analytics ─────────────────────────────────────────────────────────────
export const fetchDashboardAnalytics = (filters = {}) =>
  API.get('/analytics/dashboard', { params: filters });

// ── Prep Center ──────────────────────────────────────────────────────────
export const fetchPrepResources = (params) => API.get('/prep', { params });

// ── Coordinator Monitoring ───────────────────────────────────────────────
export const fetchCoordinatorMonitoring = () => API.get('/coordinator/monitor');
export const fetchCoordinatorList = () => API.get('/coordinator/list');
export const fetchCoordinatorTasksApi = (coordinatorId) => API.get(`/coordinator/tasks/${coordinatorId}`);
export const fetchAllCoordinatorTasksApi = () => API.get('/coordinator/tasks/all');
export const createTaskApi = (taskData) => API.post('/coordinator/tasks', taskData);
export const updateTaskStatusApi = (taskId, status) => API.patch(`/coordinator/tasks/${taskId}/status`, { status });

// Performance APIs (Admin only) — stored in coordinatorperformance collection
export const fetchAllPerformanceApi = () => API.get('/coordinator/performance');
export const fetchPerformanceApi = (coordinatorId) => API.get(`/coordinator/performance/${coordinatorId}`);
export const markCoordinatorAttendanceApi = (coordinatorId, date, present, note = '') =>
  API.post(`/coordinator/performance/${coordinatorId}/attendance`, { date, present, note });
export const assignCoordinatorBadgeApi = (coordinatorId, badge, adminNote = '') =>
  API.patch(`/coordinator/performance/${coordinatorId}/badge`, { badge, adminNote });

// ── AI Insights ───────────────────────────────────────────────────────────
export const generateAIInsightsApi = (payload) => API.post('/ai/opportunity-insights', payload);

export default API;


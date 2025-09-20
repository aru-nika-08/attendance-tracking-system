import axios from 'axios';

// Use backend URL from .env
const BASE_URL = import.meta.env.VITE_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach Firebase JWT token if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('firebaseToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// ---------------- Attendance API ----------------
export const attendanceAPI = {
  // ✅ Token-based attendance marking
  markAttendanceToken: (studentEmail, token) =>
    api.post('/attendance/mark/token', null, { params: { token, studentEmail } }),

  // Optional: old markAttendance endpoint
  markAttendance: (studentEmail, staffId, staffName, className, sessionDate, period, present) =>
    api.post('/attendance/mark', { studentEmail, staffId, staffName, className, sessionDate, period, present }),

  // Fetch student attendance summary
  getStudentAttendance: (email) =>
    api.get(`/attendance/student/${encodeURIComponent(email)}/summary`),

  // Admin endpoints
  getClassAttendance: (className, date, period) =>
    api.get('/attendance/admin/class', { params: { className, date, period } }),

  listAttendance: () =>
    api.get('/attendance/admin/class', { params: {} })
};

// ---------------- QR API ----------------
export const qrAPI = {
  generateQR: (data) =>
    api.post('/qr/generate', data)
};

//---------------- Face Recognition API ----------------
export const faceAPI = {
  registerFace: (studentId, image) =>
    api.post('/face/register', { studentId, image }),

  verifyFace: (studentId, image) =>
    api.post('/face/verify', { studentId, image })
};

export default api;

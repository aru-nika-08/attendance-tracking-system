// services/api.js
import axios from 'axios'
// Base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
// Main axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})
// Attach Firebase JWT token automatically
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('firebaseToken') // store Firebase JWT on login
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))
/* ---------------- Attendance API ---------------- */
export const attendanceAPI = {
  markAttendance: (studentEmail, token) =>
    api.post(`/attendance/mark`, null, { params: { studentEmail, token } }),

  getStudentAttendance: (email) =>
    api.get(`/attendance/student/${encodeURIComponent(email)}`),

  getCourseAttendance: (courseId, date) =>
    api.get(`/attendance/course/${encodeURIComponent(courseId)}`, { params: { date } }),

  getAllAttendance: () => api.get('/attendance/all'),

  // Alias for AdminDashboard.jsx
  listAttendance: () => api.get('/attendance/all')
}
/* ---------------- QR API ---------------- */
export const qrAPI = {
  generateQR: (data) =>
    api.post(`/qr/generate`, data),

  scanQR: (qrData) =>
    api.post(`/qr/scan`, { qrData })
}
/* ---------------- Face Recognition API ---------------- */
export const faceAPI = {
  registerFace: (studentId, image) =>
    api.post(`/face/register`, { studentId, image }),

  verifyFace: (studentId, image) =>
    api.post(`/face/verify`, { studentId, image })
}
/* ---------------- Default Export ---------------- */
export default api

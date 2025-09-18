import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const getAuthToken = async () => {
  const { auth } = await import('../firebase/config')
  const user = auth.currentUser
  if (user) {
    return await user.getIdToken()
  }
  return null
}

export const qrAPI = {
  generateQR: (data) => api.post('/api/generate-qr', data),
  validateQR: (data) => api.post('/api/validate-qr', data),
}

export const faceAPI = {
  verifyFace: (data) => api.post('/api/verify-face', data),
}

export const attendanceAPI = {
  listAttendance: () => api.get('/api/list-attendance'),
  getStudentAttendance: (email) => api.get(`/api/student-attendance?email=${email}`),
}

export default api



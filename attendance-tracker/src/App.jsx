import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Box, CircularProgress } from '@mui/material'

import Login from './components/Login'
import QRScannerNative from './components/QRScannerNative'
import FaceRecognition from './components/FaceRecognition'
import AdminDashboard from './components/AdminDashboard'
import StudentDashboard from './components/StudentDashboard'
import MarkAttendance from './components/MarkAttendance'

function App() {
  const { user, loading, isAdmin } = useAuth()

  // Wait until auth is fully ready
  if (loading || user === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // If not logged in
  if (!user) return <Login />

  const admin = isAdmin()

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={admin ? "/admin" : "/student"} replace />} />
      <Route path="/login" element={<Navigate to={admin ? "/admin" : "/student"} replace />} />

      {/* Student routes (admins can also access) */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/scan" element={<QRScannerNative />} />
      <Route path="/face" element={<FaceRecognition />} />
      <Route path="/mark-attendance" element={<MarkAttendance />} />

      {/* Admin routes */}
      <Route path="/admin" element={admin ? <AdminDashboard /> : <Navigate to="/student" replace />} />

      {/* Catch-all unknown route */}
      <Route path="*" element={<Navigate to={admin ? "/admin" : "/student"} replace />} />
    </Routes>
  )
}

export default App

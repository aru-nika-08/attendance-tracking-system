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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) return <Login />

  return (
    <Routes>
      {/* Redirect root and /login to correct dashboard */}
      <Route path="/" element={<Navigate to={isAdmin() ? "/admin" : "/scan"} replace />} />
      <Route path="/login" element={<Navigate to={isAdmin() ? "/admin" : "/scan"} replace />} />

      {/* Student routes */}
      <Route path="/scan" element={<QRScannerNative />} />
      <Route path="/face" element={<FaceRecognition />} />
      <Route path="/student" element={<StudentDashboard />} />

      {/* Admin route */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path='/mark-attendance' element={<MarkAttendance />} />

      {/* Catch-all: redirect any unknown route to proper dashboard */}
      <Route path="*" element={<Navigate to={isAdmin() ? "/admin" : "/scan"} replace />} />
    </Routes>
  )
}

export default App

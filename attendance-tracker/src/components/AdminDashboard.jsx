import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { qrAPI, attendanceAPI } from '../services/api'
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import { 
  QrCode, 
  Refresh, 
  Download, 
  Logout,
  Visibility
} from '@mui/icons-material'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [qrData, setQrData] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    generateQR()
    loadAttendance()
    
    // Auto-refresh QR every 5 seconds
    const qrInterval = setInterval(generateQR, 60000)
    
    return () => clearInterval(qrInterval)
  }, [])

  const generateQR = async () => {
    try {
      setQrLoading(true)
      const response = await qrAPI.generateQR()
      setQrData(response.data)
    } catch (error) {
      setError('Failed to generate QR code')
    } finally {
      setQrLoading(false)
    }
  }

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const response = await attendanceAPI.listAttendance()
      setAttendance(response.data)
    } catch (error) {
      setError('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Student Email', 'Date', 'Time', 'Status'],
      ...attendance.map(record => [
        record.email,
        new Date(record.timestamp).toLocaleDateString(),
        new Date(record.timestamp).toLocaleTimeString(),
        record.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success'
      case 'late': return 'warning'
      case 'absent': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* QR Code Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Attendance QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Display this QR code for students to scan. It refreshes automatically every 1 minute.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {qrLoading ? (
              <CircularProgress />
            ) : qrData ? (
              <Box>
                <QrCode sx={{ fontSize: 200, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expires: {formatDate(qrData.expiresAt)}
                </Typography>
              </Box>
            ) : (
              <Typography>No QR data available</Typography>
            )}
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={generateQR}
            disabled={qrLoading}
          >
            Refresh QR Code
          </Button>
        </Paper>

        {/* Attendance Table */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Attendance Records
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadAttendance}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportToCSV}
                disabled={attendance.length === 0}
              >
                Export CSV
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Email</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.email}</TableCell>
                        <TableCell>{formatDate(record.timestamp)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminDashboard



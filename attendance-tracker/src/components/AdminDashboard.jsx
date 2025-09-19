import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { qrAPI, attendanceAPI } from '../services/api'
import QRCode from "react-qr-code";

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
  Tooltip,
  TextField,
  Grid
} from '@mui/material'
import { 
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

  // Form state
  const [form, setForm] = useState({
    staffId: '',
    staffName: '',
    className: '',
    sessionDate: '',
    period: '',
    startTime: '',
    endTime: '',
    courseId: '',
    courseName: '',
    location: '',
    attendanceType: ''
  })

  useEffect(() => {
    loadAttendance()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const generateQR = async () => {
    try {
      setQrLoading(true)
      setError('')
      const response = await qrAPI.generateQR(form) // send form data to backend
      const { token, expiresAt } = response.data;
      const redirect =  (import.meta.env.VITE_ORIGIN_PATH || 'http://localhost:5173') + '/student?token=' + token;
      setQrData({ url: redirect, expiresAt })
    } catch (error) {
      console.error(error)
      setError('Failed to generate QR code')
      setQrData(null)
    } finally {
      setQrLoading(false)
    }
  }

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const response = await attendanceAPI.listAttendance()
      // Make sure attendance is always an array
      const records = Array.isArray(response.data) ? response.data : response.data?.data || []
      setAttendance(records)
    } catch (error) {
      setError('Failed to load attendance data')
      setAttendance([])
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

        {/* Form Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Generate Attendance QR
          </Typography>
          <Grid container spacing={2}>
            {[ 
              { label: 'Staff ID', name: 'staffId' },
              { label: 'Staff Name', name: 'staffName' },
              { label: 'Class Name', name: 'className' },
              { label: 'Session Date', name: 'sessionDate', type: 'date' },
              { label: 'Period', name: 'period' },
              { label: 'Start Time', name: 'startTime', type: 'time' },
              { label: 'End Time', name: 'endTime', type: 'time' },
              { label: 'Course ID', name: 'courseId' },
              { label: 'Course Name', name: 'courseName' },
              { label: 'Location', name: 'location' },
              { label: 'Attendance Type', name: 'attendanceType' }
            ].map((field, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  type={field.type || 'text'}
                  value={form[field.name]}
                  onChange={handleInputChange}
                />
              </Grid>
            ))}
          </Grid>
          <Box mt={2}>
            <Button
              variant="contained"
              onClick={generateQR}
              disabled={qrLoading}
            >
              Generate QR
            </Button>
          </Box>
        </Paper>

        {/* QR Code Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Attendance QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Display this QR code for students to scan.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {qrLoading ? (
              <CircularProgress />
            ) : qrData ? (
              <Box>
                <QRCode value={qrData.url} size={200} />
                <Typography variant="caption" color="text.secondary">
                  Expires: {formatDate(qrData.expiresAt)}
                </Typography>
                <Box>
                  <a target='_blank' href={qrData.url} rel="noreferrer">Link</a>
                </Box>
              </Box>
            ) : (
              <Typography>No QR data available</Typography>
            )}
          </Box>
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
                  {Array.isArray(attendance) && attendance.length > 0 ? (
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
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
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

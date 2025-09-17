import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { attendanceAPI } from '../services/api'
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
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { 
  QrCodeScanner, 
  History, 
  Logout,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material'

const StudentDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0
  })

  useEffect(() => {
    loadAttendance()
  }, [])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const response = await attendanceAPI.getStudentAttendance(user.email)
      setAttendance(response.data)
      
      // Calculate stats
      const total = response.data.length
      const present = response.data.filter(r => r.status === 'present').length
      const late = response.data.filter(r => r.status === 'late').length
      const absent = response.data.filter(r => r.status === 'absent').length
      
      setStats({ total, present, late, absent })
    } catch (error) {
      setError('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle color="success" />
      case 'late': return <Schedule color="warning" />
      case 'absent': return <Cancel color="error" />
      default: return <Cancel />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success'
      case 'late': return 'warning'
      case 'absent': return 'error'
      default: return 'default'
    }
  }

  const attendancePercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
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
        
        {/* Welcome Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user.displayName || user.email}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Track your attendance and scan QR codes for class attendance
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<QrCodeScanner />}
            onClick={() => navigate('/scan')}
            sx={{ mr: 2 }}
          >
            Scan QR Code
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={loadAttendance}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Classes
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Present
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.present}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Late
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.late}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Attendance %
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {attendancePercentage}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Attendance History */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Attendance History
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : attendance.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No attendance records found
            </Typography>
          ) : (
            <List>
              {attendance.map((record, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {getStatusIcon(record.status)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {formatDate(record.timestamp)}
                          </Typography>
                          <Chip 
                            label={record.status} 
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={record.className || 'Class Attendance'}
                    />
                  </ListItem>
                  {index < attendance.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default StudentDashboard



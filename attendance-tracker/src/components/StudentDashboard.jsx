import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI, qrAPI } from '../services/api';
import { Container, Paper, Box, Typography, Button, Alert, CircularProgress, AppBar, Toolbar, Card, CardContent, Grid, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { QrCodeScanner, History, CheckCircle, Schedule, Cancel } from '@mui/icons-material';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (token) {
      const mark = async () => {
        try {
          const response = await qrAPI.scanQR({ token, email: user.email });
          if (response.data) console.log('Attendance marked!');
          loadAttendance();
        } catch (err) {
          console.error(err);
          setError('Failed to mark attendance');
        }
      };
      mark();
    } else {
      loadAttendance();
    }
  }, [token]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getStudentAttendance(user.email);
      const dataArray = Array.isArray(response.data) ? response.data : [];
      setAttendance(dataArray);

      const total = dataArray.length;
      const present = dataArray.filter(r => r.status === 'present').length;
      const late = dataArray.filter(r => r.status === 'late').length;
      const absent = dataArray.filter(r => r.status === 'absent').length;
      setStats({ total, present, late, absent });
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance data');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error('Logout error:', err); }
  };

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();
  const getStatusIcon = (status) => status === 'present' ? <CheckCircle color="success"/> : status === 'late' ? <Schedule color="warning"/> : <Cancel color="error"/>;
  const getStatusColor = (status) => status === 'present' ? 'success' : status === 'late' ? 'warning' : 'error';
  const attendancePercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Student Dashboard</Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Welcome Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Welcome, {user.displayName || user.email}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Track your attendance and scan QR codes for class attendance
          </Typography>

          <Button variant="contained" size="large" startIcon={<QrCodeScanner />} onClick={() => navigate('/scan')} sx={{ mr: 2 }}>
            Scan QR Code
          </Button>
          <Button variant="outlined" startIcon={<History />} onClick={loadAttendance} disabled={loading}>
            Refresh Data
          </Button>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'Total Classes', value: stats.total },
            { label: 'Present', value: stats.present, color: 'success.main' },
            { label: 'Late', value: stats.late, color: 'warning.main' },
            { label: 'Attendance %', value: attendancePercentage + '%', color: 'primary.main' }
          ].map((card, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>{card.label}</Typography>
                  <Typography variant="h4" sx={{ color: card.color || 'text.primary' }}>{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Attendance History */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Attendance History</Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress/></Box>
          ) : !attendance.length ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No attendance records found</Typography>
          ) : (
            <List>
              {attendance.map((record, i) => (
                <React.Fragment key={i}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>{getStatusIcon(record.status)}</Box>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">{formatDate(record.markedAt)}</Typography>
                          <Chip label={record.status} color={getStatusColor(record.status)} size="small"/>
                        </Box>
                      }
                      secondary={record.courseName || 'Class Attendance'}
                    />
                  </ListItem>
                  {i < attendance.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentDashboard;

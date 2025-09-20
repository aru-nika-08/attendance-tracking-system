import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { qrAPI, attendanceAPI } from '../services/api';
import QRCode from 'react-qr-code';
import {
  Container, Paper, Box, Typography, Button, Alert, CircularProgress,
  AppBar, Toolbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Grid, TextField
} from '@mui/material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({
    staffId: '', staffName: '', className: '', sessionDate: '',
    period: '', startTime: '', endTime: '', courseId: '',
    courseName: '', location: '', attendanceType: ''
  });
  const [qrData, setQrData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Generate QR manually & start auto-refresh
  const generateQR = async () => {
    if (!form.className || !form.sessionDate || !form.period) {
      setError('Class Name, Session Date, and Period are required');
      return;
    }
    try {
      setQrLoading(true);
      setError('');
      const response = await qrAPI.generateQR(form);
      const { token, expiresAt } = response.data;
      const redirect = `${import.meta.env.VITE_ORIGIN_PATH || 'http://localhost:5173'}/student?token=${token}`;
      setQrData({ token, url: redirect, expiresAt });
      setCountdown(5);

      // Start auto-refresh interval
      startQRRefresh();
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // Function to refresh QR every 5s
  const startQRRefresh = () => {
    // Clear any previous interval
    if (window.qrInterval) clearInterval(window.qrInterval);
    window.qrInterval = setInterval(async () => {
      try {
        const response = await qrAPI.generateQR(form);
        const { token, expiresAt } = response.data;
        const redirect = `${import.meta.env.VITE_ORIGIN_PATH || 'http://localhost:5173'}/student?token=${token}`;
        setQrData({ token, url: redirect, expiresAt });
        setCountdown(5);
      } catch (err) {
        console.error('Failed to refresh QR', err);
      }
    }, 5000);

    // Countdown timer
    if (!window.qrCountdownInterval) {
      window.qrCountdownInterval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 5));
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup intervals on unmount
      if (window.qrInterval) clearInterval(window.qrInterval);
      if (window.qrCountdownInterval) clearInterval(window.qrCountdownInterval);
    };
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getClassAttendance(form.className, form.sessionDate, form.period);
      setAttendance(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance data');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Student Email', 'Date & Time', 'Status'],
      ...attendance.map(r => [
        r.studentEmail,
        new Date(r.markedAt).toLocaleString(),
        r.status || (r.present ? 'present' : 'absent')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = async () => { try { await logout(); } catch(err){ console.error(err); } }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Dashboard</Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Form */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Generate Attendance QR</Typography>
          <Grid container spacing={2}>
            {['staffId','staffName','className','sessionDate','period','startTime','endTime','courseId','courseName','location','attendanceType']
              .map((name) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <TextField
                  fullWidth
                  label={name}
                  name={name}
                  type={name.includes('Date') ? 'date' : name.includes('Time') ? 'time' : 'text'}
                  value={form[name]}
                  onChange={handleInputChange}
                />
              </Grid>
            ))}
          </Grid>
          <Box mt={2}>
            <Button variant="contained" onClick={generateQR} disabled={qrLoading}>
              {qrLoading ? 'Generating...' : 'Generate QR'}
            </Button>
            <Button variant="outlined" onClick={loadAttendance} sx={{ ml:2 }} disabled={loading}>Load Attendance</Button>
          </Box>
        </Paper>

        {/* QR */}
        {qrData && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign:'center' }}>
            <Typography variant="h5" gutterBottom>Attendance QR Code</Typography>
            <QRCode value={qrData.url} size={200} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Refreshing in: {countdown}s
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await attendanceAPI.markAttendanceToken('727723euit216@skcet.ac.in', qrData.token);
                    await loadAttendance();
                    alert('Attendance marked!');
                  } catch(err) {
                    console.error(err);
                    alert('Failed to mark attendance');
                  } finally { setLoading(false); }
                }}
              >
                Click to Mark Attendance
              </Button>
            </Box>
          </Paper>
        )}

        {/* Attendance Table */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h5">Attendance Records</Typography>
            <Box>
              <Button variant="outlined" onClick={loadAttendance} disabled={loading} sx={{ mr:1 }}>Refresh</Button>
              <Button variant="contained" onClick={exportToCSV} disabled={!attendance.length}>Export CSV</Button>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Email</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.length ? attendance.map((r,i)=>(
                    <TableRow key={i}>
                      <TableCell>{r.studentEmail}</TableCell>
                      <TableCell>{new Date(r.markedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={r.status || (r.present?'present':'absent')} color={r.present?'success':r.status==='late'?'warning':'error'} size="small"/>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No records</TableCell>
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

export default AdminDashboard;

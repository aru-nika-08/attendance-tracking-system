import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { qrAPI, attendanceAPI } from '../services/api';
import QRCode from "react-qr-code";
import { 
  Container, Paper, Box, Typography, Button, Alert,
  CircularProgress, AppBar, Toolbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  IconButton, Tooltip, TextField, Grid
} from '@mui/material';
import { Refresh, Download, Logout, Visibility } from '@mui/icons-material';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    staffId: '', staffName: '', className: '', sessionDate: '',
    period: '', startTime: '', endTime: '', courseId: '',
    courseName: '', location: '', attendanceType: ''
  });

  useEffect(() => {
    loadAttendance();
    const interval = setInterval(loadAttendance, 10000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const generateQR = async () => {
    try {
      setQrLoading(true);
      setError('');
      const response = await qrAPI.generateQR(form);
      const { token, expiresAt } = response.data;
      const redirect = (import.meta.env.VITE_ORIGIN_PATH || 'http://localhost:5173') + '/mark-attendance?token=' + token;
      setQrData({ url: redirect, expiresAt });
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code');
      setQrData(null);
    } finally {
      setQrLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.listAttendance();
      setAttendance(response.data);
    } catch (err) {
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Student Email', 'Date', 'Time', 'Status'],
      ...attendance.map(r => [
        r.email,
        new Date(r.timestamp).toLocaleDateString(),
        new Date(r.timestamp).toLocaleTimeString(),
        r.status
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

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error(err); }
  };

  const formatDate = ts => new Date(ts).toLocaleString();
  const getStatusColor = status => status === 'present' ? 'success' : status === 'late' ? 'warning' : 'error';

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

        {/* QR Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Generate Attendance QR</Typography>
          <Grid container spacing={2}>
            {Object.keys(form).map((key, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <TextField
                  fullWidth
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  name={key}
                  type={key.includes('Date') ? 'date' : key.includes('Time') ? 'time' : 'text'}
                  value={form[key]}
                  onChange={handleInputChange}
                />
              </Grid>
            ))}
          </Grid>
          <Box mt={2}>
            <Button variant="contained" onClick={generateQR} disabled={qrLoading}>Generate QR</Button>
          </Box>
        </Paper>

        {/* QR Display */}
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5">Attendance QR Code</Typography>
          {qrLoading ? <CircularProgress /> : qrData ? (
            <Box>
              <QRCode value={qrData.url} size={200} />
              <Typography variant="caption">Expires: {formatDate(qrData.expiresAt)}</Typography>
              <Box><a href={qrData.url} target="_blank" rel="noreferrer">Link</a></Box>
            </Box>
          ) : <Typography>No QR data available</Typography>}
        </Paper>

        {/* Attendance Table */}
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h5">Attendance Records</Typography>
            <Box>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadAttendance} disabled={loading} sx={{ mr: 1 }}>Refresh</Button>
              <Button variant="contained" startIcon={<Download />} onClick={exportToCSV} disabled={attendance.length === 0}>Export CSV</Button>
            </Box>
          </Box>
          {loading ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> :
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
                      <TableCell colSpan={4} align="center">No attendance records found</TableCell>
                    </TableRow>
                  ) : attendance.map((record, i) => (
                    <TableRow key={i}>
                      <TableCell>{record.email}</TableCell>
                      <TableCell>{formatDate(record.timestamp)}</TableCell>
                      <TableCell>
                        <Chip label={record.status} color={getStatusColor(record.status)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small"><Visibility /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;

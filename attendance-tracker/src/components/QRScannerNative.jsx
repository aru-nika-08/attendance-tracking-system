import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import { 
  Box, Button, Typography, AppBar, Toolbar, Paper, Alert, CircularProgress 
} from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerNative = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const qrCodeRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Start camera scanning
  const startCamera = async () => {
    if (!user) return setError('User not logged in');
    setError('');
    setScanning(true);
    html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrCodeMessage => handleQRScan(qrCodeMessage)
      );
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Make sure HTTPS or localhost.');
      setScanning(false);
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
      setScanning(false);
    }
  };

  // Handle QR scan
  const handleQRScan = async (token) => {
    try {
      await attendanceAPI.markAttendanceToken(user.email, token);
      navigate('/student?marked=1', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Failed to mark attendance from QR');
    }
  };

  // Manual mark (simulate QR scan)
  const handleManualMark = async () => {
    if (!user) return setError('User not logged in');
    setLoading(true);
    setError('');
    try {
      await attendanceAPI.markAttendanceManual(
        user.email,                     // student email
        'manual-staff',                 // staffId
        'Manual Staff',                 // staffName
        'Manual Class',                 // className
        new Date().toISOString().split('T')[0], // sessionDate
        '1',                            // period
        '09:00', '10:00',               // startTime, endTime
        'MAN001', 'Manual Course',      // courseId, courseName
        'Manual Location',              // location
        'manual'                        // attendanceType
      );
      navigate('/student?marked=1', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Failed to mark attendance manually');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>QR Scanner</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Scan Attendance QR</Typography>
          <Box id="qr-reader" sx={{ mb: 2, width: '100%', height: 300, bgcolor: '#eee' }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              startIcon={<QrCodeScanner />} 
              onClick={startCamera} 
              disabled={scanning}
            >
              Start Camera
            </Button>

            <Button 
              variant="outlined" 
              onClick={stopCamera} 
              disabled={!scanning}
            >
              Stop Camera
            </Button>

            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleManualMark} 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Manual Mark'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default QRScannerNative;

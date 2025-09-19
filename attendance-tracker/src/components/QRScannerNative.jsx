import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import { Box, Button, Typography, Alert } from '@mui/material';
import { QrReader } from 'react-qr-reader';

const QRScannerNative = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleResult = async (result, scanError) => {
    if (scanError) return; // ignore scanning noise
    if (!result) return;

    const token = result?.text || result;
    if (!token) {
      setError('QR did not contain a token');
      return;
    }

    try {
      setBusy(true);
      // Mark attendance via backend
      await attendanceAPI.markAttendance(user.email, token);

      // Redirect to dashboard with token param to trigger refresh
      navigate(`/dashboard?token=${token}`);
    } catch (err) {
      console.error('Mark attendance failed', err);
      setError('Failed to mark attendance. Token may be invalid or expired.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Scan QR for Attendance</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ width: 400, maxWidth: '100%', mx: 'auto' }}>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          scanDelay={500}
          onResult={(result, e) => { if (result) handleResult(result); }}
          containerStyle={{ width: '100%' }}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" disabled={busy} onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default QRScannerNative;

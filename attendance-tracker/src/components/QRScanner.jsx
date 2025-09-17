import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { qrAPI } from '../services/api'
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Alert,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material'
import { ArrowBack, QrCodeScanner } from '@mui/icons-material'
import { BarcodeScannerComponent } from 'react-qr-barcode-scanner'

const QRScanner = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async (result) => {
    if (result && result.text && !loading) {
      setLoading(true)
      setError('')
      
      try {
        const response = await qrAPI.validateQR({
          token: result.text,
          email: user.email
        })
        
        if (response.data.valid) {
          // Store sessionId for face recognition
          sessionStorage.setItem('sessionId', response.data.sessionId)
          navigate('/face')
        } else {
          setError('Invalid QR code. Please try again.')
        }
      } catch (error) {
        setError('Failed to validate QR code. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleError = (err) => {
    console.error('QR Scanner Error:', err)
    setError('Camera error. Please check permissions and try again.')
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Scan QR Code
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Scan Attendance QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Point your camera at the QR code displayed by your teacher
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ position: 'relative', mb: 2 }}>
            {scanning && (
              <BarcodeScannerComponent
                width={400}
                height={400}
                onUpdate={(err, result) => {
                  if (result) handleScan({ text: result.getText() })
                  if (err) handleError(err)
                }}
              />
            )}
            
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  p: 2,
                  borderRadius: 1
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Validating QR code...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/student')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          
          <Button
            variant="contained"
            startIcon={<QrCodeScanner />}
            onClick={() => setScanning(!scanning)}
          >
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}

export default QRScanner

import React, { useState, useRef, useEffect } from 'react'
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
  Toolbar,
  TextField
} from '@mui/material'
import { ArrowBack, QrCodeScanner, CameraAlt } from '@mui/icons-material'

const QRScannerAlternative = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  const handleManualSubmit = async () => {
    if (!manualToken.trim()) {
      setError('Please enter a QR token')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await qrAPI.validateQR({
        token: manualToken.trim(),
        email: user.email
      })
      
      if (response.data.valid) {
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
            Use the camera scanner or manually enter the QR token
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            {!showManualInput ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Camera Scanner
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    height: '300px',
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <CameraAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Camera scanner not available
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Use manual input instead
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  onClick={() => setShowManualInput(true)}
                  sx={{ mb: 2 }}
                >
                  Enter QR Token Manually
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Manual QR Token Input
                </Typography>
                <TextField
                  fullWidth
                  label="QR Token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter the QR token from your teacher"
                  sx={{ mb: 2, maxWidth: '400px' }}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowManualInput(false)}
                  >
                    Back to Scanner
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleManualSubmit}
                    disabled={loading || !manualToken.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <QrCodeScanner />}
                  >
                    {loading ? 'Validating...' : 'Validate Token'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/student')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default QRScannerAlternative



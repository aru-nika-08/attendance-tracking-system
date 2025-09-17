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
import { ArrowBack, QrCodeScanner, CameraAlt, Keyboard } from '@mui/icons-material'

const QRScannerNative = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setCameraError(false)
      console.log('Starting camera')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setScanning(true)
      console.log('Camera started')
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError(true)
      setError('Camera access denied. Please use manual input.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setScanning(false)
  }

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      // Here you would implement QR code detection
      // For now, we'll simulate it
      return canvas.toDataURL('image/jpeg', 0.8)
    }
    return null
  }

  const handleQRDetection = async (qrData) => {
    if (!qrData || loading) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await qrAPI.validateQR({
        token: qrData,
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

  const handleManualSubmit = async () => {
    if (!manualToken.trim()) {
      setError('Please enter a QR token')
      return
    }

    await handleQRDetection(manualToken.trim())
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
            Use the camera to scan QR codes or enter the token manually
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
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', transform: 'scaleX(-1)' }} />
                <Box sx={{ position: 'relative', mb: 2 }}>
                  {scanning && !cameraError ? (
                    <Box>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ 
                          width: '100%', 
                          maxWidth: '400px', 
                          borderRadius: '8px',
                          transform: 'scaleX(-1)' // Mirror the video
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        style={{ display: 'none' }}
                      />
                    </Box>
                  ) : (
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
                        {cameraError ? 'Camera not available' : 'Camera ready'}
                      </Typography>
                    </Box>
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
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                  {!scanning ? (
                    <Button
                      variant="contained"
                      startIcon={<CameraAlt />}
                      onClick={startCamera}
                    >
                      Start Camera
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Keyboard />}
                    onClick={() => setShowManualInput(true)}
                  >
                    Manual Input
                  </Button>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Note: QR detection is simulated. Use manual input for testing.
                </Typography>
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

export default QRScannerNative



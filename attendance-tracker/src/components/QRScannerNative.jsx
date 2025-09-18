// QRScannerNative.jsx
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
  TextField,
  Snackbar
} from '@mui/material'
import { ArrowBack, QrCodeScanner, CameraAlt, Keyboard } from '@mui/icons-material'
import jsQR from 'jsqr'

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
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [stream])

  useEffect(() => {
    let interval
    if (scanning && videoRef.current) {
      interval = setInterval(() => {
        detectQR()
      }, 500)
    }
    return () => clearInterval(interval)
  }, [scanning])

  const startCamera = async () => {
    try {
      setCameraError(false)
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = mediaStream
      setScanning(true)
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError(true)
      setError('Camera access denied. Please use manual input.')
    }
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop())
    setStream(null)
    setScanning(false)
  }

  const detectQR = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code) {
      setScanning(false) // stop scanning while validating
      handleQRDetection(code.data)
    }
  }

  const handleQRDetection = async (qrData) => {
    if (!qrData || loading) return
    setLoading(true)
    setError('')

    try {
      // 1️⃣ Validate QR
      const response = await qrAPI.validateQR({
        token: qrData,
        email: user.email
      })

      if (response.data.valid) {
        // 2️⃣ Store sessionId
        sessionStorage.setItem('sessionId', response.data.sessionId)

        // 3️⃣ Automatically mark attendance
        await qrAPI.markAttendance({
          sessionId: response.data.sessionId,
          email: user.email
        })

        // 4️⃣ Show success snackbar
        setSuccess(true)

        // 5️⃣ Redirect to student dashboard after short delay
        setTimeout(() => {
          navigate('/student')
        }, 1500)
      } else {
        setError('Invalid QR code. Please try again.')
        setScanning(true) // allow retry
      }
    } catch (err) {
      console.error(err)
      setError('Failed to validate QR code. Please try again.')
      setScanning(true) // allow retry
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
    } catch (err) {
      console.error('Logout error:', err)
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

          {!showManualInput ? (
            <Box>
              <Typography variant="h6" gutterBottom>Camera Scanner</Typography>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', maxWidth: 400, borderRadius: 8, transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2, mb: 2 }}>
                {!scanning ? (
                  <Button variant="contained" startIcon={<CameraAlt />} onClick={startCamera}>
                    Start Camera
                  </Button>
                ) : (
                  <Button variant="outlined" onClick={stopCamera}>Stop Camera</Button>
                )}
                <Button variant="outlined" startIcon={<Keyboard />} onClick={() => setShowManualInput(true)}>
                  Manual Input
                </Button>
              </Box>

              {loading && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>Validating QR code...</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>Manual QR Token Input</Typography>
              <TextField
                fullWidth
                label="QR Token"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Enter the QR token from your teacher"
                sx={{ mb: 2, maxWidth: 400 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => setShowManualInput(false)}>Back to Scanner</Button>
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

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/student')}>
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={1500}
        onClose={() => setSuccess(false)}
        message="Attendance marked successfully!"
      />
    </Box>
  )
}

export default QRScannerNative

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { faceAPI } from '../services/api'
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
import { ArrowBack, CameraAlt, CheckCircle } from '@mui/icons-material'

const FaceRecognition = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [captured, setCaptured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('sessionId')
    if (!storedSessionId) {
      navigate('/scan')
      return
    }
    setSessionId(storedSessionId)
    
    startCamera()
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      setCaptured(true)
    }
  }

  const retakePhoto = () => {
    setCaptured(false)
    setError('')
    setSuccess(false)
  }

  const submitPhoto = async () => {
    if (!canvasRef.current) return
    
    setLoading(true)
    setError('')
    
    try {
      const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8)
      
      const response = await faceAPI.verifyFace({
        image: base64Image,
        sessionId: sessionId,
        email: user.email
      })
      
      if (response.data.success) {
        setSuccess(true)
        // Clear session storage
        sessionStorage.removeItem('sessionId')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/student')
        }, 2000)
      } else {
        setError('Face verification failed. Please try again.')
      }
    } catch (error) {
      setError('Failed to verify face. Please try again.')
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

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={3}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Attendance Marked Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
            <CircularProgress sx={{ mt: 2 }} />
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Face Recognition
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Take a Selfie for Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Look directly at the camera and ensure good lighting
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ position: 'relative', mb: 3 }}>
            {!captured ? (
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
            ) : (
              <canvas
                ref={canvasRef}
                style={{ 
                  width: '100%', 
                  maxWidth: '400px', 
                  borderRadius: '8px',
                  transform: 'scaleX(-1)' // Mirror the canvas
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
                  Verifying face...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/scan')}
            >
              Back to Scanner
            </Button>
            
            {!captured ? (
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={capturePhoto}
                disabled={!stream}
              >
                Capture Photo
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={retakePhoto}
                >
                  Retake
                </Button>
                <Button
                  variant="contained"
                  onClick={submitPhoto}
                  disabled={loading}
                >
                  Submit for Verification
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default FaceRecognition



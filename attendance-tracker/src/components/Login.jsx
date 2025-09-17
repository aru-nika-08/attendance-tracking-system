import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Alert,
  CircularProgress
} from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'

const Login = () => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithGoogle()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
          <Typography variant="h4" component="h1" gutterBottom>
            Attendance Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in with your SKCET email to continue
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Only @skcet.ac.in email addresses are allowed
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login



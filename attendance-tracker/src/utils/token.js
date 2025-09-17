// Time-based token utilities for QR codes
export const generateTimeBasedToken = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `${timestamp}_${random}`
}

export const parseToken = (token) => {
  try {
    const [timestamp] = token.split('_')
    return {
      timestamp: parseInt(timestamp),
      isValid: !isNaN(parseInt(timestamp))
    }
  } catch (error) {
    return {
      timestamp: null,
      isValid: false
    }
  }
}

export const isTokenExpired = (token, ttlMs = 5000) => {
  const { timestamp, isValid } = parseToken(token)
  if (!isValid) return true
  
  const now = Date.now()
  return (now - timestamp) > ttlMs
}



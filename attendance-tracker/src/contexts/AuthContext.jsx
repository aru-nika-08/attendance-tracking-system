import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

const ADMIN_EMAILS = ["727723euit216@skcet.ac.in"]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirectLoading, setRedirectLoading] = useState(false)

  // Handle redirect login result (Firebase redirect flow)
  useEffect(() => {
    const handleRedirect = async () => {
      setRedirectLoading(true)
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          const u = result.user
          if (!u.email.endsWith('@skcet.ac.in')) {
            await signOut(auth)
            throw new Error('Only SKCET email addresses are allowed')
          }
          setUser(u)
        }
      } catch (err) {
        console.error('Redirect login error:', err)
      } finally {
        setRedirectLoading(false)
      }
    }
    handleRedirect()
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Sign in with Google: popup in dev, redirect in production
  const signInWithGoogle = async () => {
    try {
      const isProduction = window.location.hostname !== 'localhost'

      if (isProduction) {
        // Production: use redirect → prevents COOP/ gapi warnings
        setRedirectLoading(true)
        await signInWithRedirect(auth, googleProvider)
        return
      }

      // Development: use popup for convenience
      const result = await signInWithPopup(auth, googleProvider)
      const u = result.user

      if (!u.email.endsWith('@skcet.ac.in')) {
        await signOut(auth)
        throw new Error('Only SKCET email addresses are allowed')
      }

      setUser(u)
      return u
    } catch (err) {
      console.error('Google sign-in error:', err)
      throw err
    } finally {
      setRedirectLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (err) {
      throw err
    }
  }

  const isAdmin = () => {
    return user && ADMIN_EMAILS.includes(user.email.toLowerCase())
  }

  const value = {
    user,
    loading,
    redirectLoading,
    signInWithGoogle,
    logout,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {(!loading && !redirectLoading) && children}
    </AuthContext.Provider>
  )
}

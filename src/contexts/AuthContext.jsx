import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    console.log('AuthProvider mounted, token:', token ? 'exists' : 'none')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      console.log('Fetching user profile...')
      const response = await api.get('/auth/me')
      console.log('Fetch user response:', response.data)
      
      // Check different possible response structures
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
      } else if (response.data.user) {
        setUser(response.data.user)
      } else if (response.data.data) {
        setUser(response.data.data)
      } else {
        console.error('Unexpected response format:', response.data)
        // If we can't get user data but have token, maybe token is invalid
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email)
      const response = await api.post('/auth/login', { email, password })
      console.log('Login response:', response.data)
      
      // Check response structure - your backend returns {success: true, token, user}
      if (response.data.success && response.data.token && response.data.user) {
        const { token, user } = response.data
        
        // Save to localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update state
        setToken(token)
        setUser(user)
        
        toast.success(`Welcome back, ${user.name}!`)
        return { success: true }
      } else {
        console.error('Unexpected response structure:', response.data)
        return { 
          success: false, 
          error: 'Invalid response from server' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
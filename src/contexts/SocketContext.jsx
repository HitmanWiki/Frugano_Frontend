import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [online, setOnline] = useState(false)
  const { isAuthenticated } = useAuth()

  // Detect if running on Vercel (production)
  const isVercel = import.meta.env.VITE_VERCEL === 'true' || window.location.hostname.includes('vercel.app');

  useEffect(() => {
    // Disable WebSockets on Vercel
    if (isVercel) {
      console.log('🔌 WebSockets disabled on Vercel, using polling mode');
      setOnline(true); // Assume online for API calls
      return;
    }

    if (isAuthenticated) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      
      const socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['polling', 'websocket'] // polling first, then websocket
      })

      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected')
        setOnline(true)
      })

      socketInstance.on('connect_error', (error) => {
        console.log('🔌 Socket connection error (falling back to polling):', error.message)
        // Still mark as online for API calls
        setOnline(true)
      })

      socketInstance.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
        setOnline(false)
      })

      setSocket(socketInstance)

      return () => {
        if (socketInstance) {
          socketInstance.disconnect()
        }
      }
    }
  }, [isAuthenticated, isVercel])

  // Mock socket events for Vercel
  const emit = (event, data) => {
    if (!isVercel && socket && online) {
      socket.emit(event, data)
    } else {
      console.log('📡 Mock socket emit:', event, data)
    }
  }

  const value = {
    socket,
    online,
    emit
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
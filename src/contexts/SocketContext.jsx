import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

// ✅ Make sure to export useSocket as a named export
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

  useEffect(() => {
    if (isAuthenticated) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      const socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      })

      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected')
        setOnline(true)
        toast.success('Real-time connection established')
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason)
        setOnline(false)
        if (reason === 'io server disconnect') {
          // Reconnect manually if server disconnected
          socketInstance.connect()
        }
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setOnline(false)
      })

      socketInstance.on('sale-updated', (data) => {
        toast.success(`💰 New sale: ₹${data.amount}`)
      })

      socketInstance.on('stock-updated', (data) => {
        toast.success(`📦 Stock updated for ${data.productName}`)
      })

      socketInstance.on('alert', (data) => {
        if (data.type === 'LOW_STOCK') {
          toast.error(`⚠️ Low stock alert: ${data.message}`)
        } else if (data.type === 'OUT_OF_STOCK') {
          toast.error(`❌ Out of stock: ${data.message}`)
        }
      })

      socketInstance.on('order-status-updated', (data) => {
        toast.success(`📋 Order #${data.orderNumber} status: ${data.status}`)
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.off('connect')
        socketInstance.off('disconnect')
        socketInstance.off('connect_error')
        socketInstance.off('sale-updated')
        socketInstance.off('stock-updated')
        socketInstance.off('alert')
        socketInstance.off('order-status-updated')
        socketInstance.disconnect()
      }
    }
  }, [isAuthenticated])

  const emit = (event, data) => {
    if (socket && online) {
      socket.emit(event, data)
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
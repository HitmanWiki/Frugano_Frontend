import { useContext } from 'react'
import { SocketContext } from '../contexts/SocketContext'

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const useSocketEvent = (event, handler) => {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, handler])
}

export const useSalesUpdates = (callback) => {
  useSocketEvent('sale-updated', callback)
}

export const useStockUpdates = (callback) => {
  useSocketEvent('stock-updated', callback)
}

export const useAlerts = (callback) => {
  useSocketEvent('alert', callback)
}
import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (this.socket) return

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.emit('connection-established', { timestamp: new Date() })
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event, callback) {
    if (!this.socket) return
    this.socket.on(event, callback)
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    if (!this.socket) return
    if (callback) {
      this.socket.off(event, callback)
      this.listeners.get(event)?.delete(callback)
    } else {
      this.socket.off(event)
      this.listeners.delete(event)
    }
  }

  emit(event, data) {
    if (!this.socket) return
    this.socket.emit(event, data)
  }

  // Specific event emitters
  joinStore(storeId) {
    this.emit('join-store', { storeId })
  }

  onNewSale(callback) {
    this.on('sale-updated', callback)
  }

  onStockUpdate(callback) {
    this.on('stock-updated', callback)
  }

  onAlert(callback) {
    this.on('alert', callback)
  }

  onOrderStatusUpdate(callback) {
    this.on('order-status-updated', callback)
  }

  // Clean up all listeners
  removeAllListeners() {
    if (!this.socket) return
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.off(event, callback)
      })
    })
    this.listeners.clear()
  }
}

export default new SocketService()
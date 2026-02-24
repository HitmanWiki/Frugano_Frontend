import api from './api'

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  }

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  }

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  }

  async setupOwner(userData) {
    const response = await api.post('/auth/setup', userData)
    return response.data
  }

  getToken() {
    return localStorage.getItem('token')
  }

  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

export default new AuthService()
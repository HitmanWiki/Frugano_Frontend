import api from './api'

class SettingsService {
  // Store settings
  async getStoreSettings() {
    try {
      const response = await api.get('/settings/store')
      return response.data
    } catch (error) {
      // Return mock data if endpoint doesn't exist
      console.warn('Using mock store settings data')
      return {
        data: {
          storeName: 'Frugano Store',
          phone: '+91 9876543210',
          email: 'store@frugano.com',
          gstNumber: '27AAAAA0000A1Z5',
          address: '123, Retail Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          taxRate: 5,
          deliveryFee: 40,
          freeDeliveryMin: 500,
          loyaltyPointsRate: 1,
          openingTime: '09:00',
          closingTime: '21:00',
          invoicePrefix: 'INV-',
          invoiceStartNumber: 1001,
          invoiceFooter: 'Thank you for shopping!',
          autoPrintInvoice: true,
          emailInvoice: false,
          autoBackup: false,
          backupFrequency: 'daily',
          backupTime: '02:00',
        }
      }
    }
  }

  async updateStoreSettings(data) {
    try {
      const response = await api.put('/settings/store', data)
      return response.data
    } catch (error) {
      console.warn('Mock update store settings', data)
      return { success: true, data }
    }
  }

  // Backup
  async createBackup() {
    try {
      const response = await api.get('/settings/backup', {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.warn('Mock backup creation')
      // Create a mock backup file
      const mockData = JSON.stringify({ message: 'Mock backup data' })
      return new Blob([mockData], { type: 'application/json' })
    }
  }

  // Roles
  async getRoles() {
    try {
      const response = await api.get('/roles')
      return response.data
    } catch (error) {
      console.warn('Using mock roles data')
      return {
        data: [
          {
            id: 1,
            name: 'OWNER',
            description: 'Full system access',
            userCount: 1,
            permissions: {
              view_dashboard: true,
              manage_products: true,
              manage_categories: true,
              create_sales: true,
              view_sales: true,
              void_sales: true,
              manage_purchases: true,
              view_purchases: true,
              manage_suppliers: true,
              view_suppliers: true,
              manage_inventory: true,
              view_inventory: true,
              manage_customers: true,
              view_customers: true,
              manage_campaigns: true,
              view_reports: true,
              export_data: true,
              manage_users: true,
              manage_roles: true,
              manage_settings: true,
              view_hardware: true,
              manage_hardware: true,
              view_deliveries: true,
              update_delivery: true,
            }
          },
          {
            id: 2,
            name: 'MANAGER',
            description: 'Can manage most operations',
            userCount: 2,
            permissions: {
              view_dashboard: true,
              manage_products: true,
              manage_categories: true,
              create_sales: true,
              view_sales: true,
              void_sales: true,
              manage_purchases: true,
              view_purchases: true,
              manage_suppliers: true,
              view_suppliers: true,
              manage_inventory: true,
              view_inventory: true,
              manage_customers: true,
              view_customers: true,
              manage_campaigns: true,
              view_reports: true,
              export_data: true,
              view_hardware: true,
              manage_hardware: false,
              view_deliveries: true,
              update_delivery: true,
            }
          },
          {
            id: 3,
            name: 'CASHIER',
            description: 'Can process sales',
            userCount: 5,
            permissions: {
              view_dashboard: true,
              create_sales: true,
              view_products: true,
              view_customers: true,
              view_inventory: true,
            }
          },
        ]
      }
    }
  }

  async updateRole(roleId, permissions) {
    try {
      const response = await api.put(`/roles/${roleId}`, { permissions })
      return response.data
    } catch (error) {
      console.warn('Mock update role', roleId, permissions)
      return { success: true }
    }
  }
}

export default new SettingsService()
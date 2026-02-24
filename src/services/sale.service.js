import api from './api'

class SaleService {
  async getSales(params = {}) {
    const response = await api.get('/sales', { params })
    return response.data
  }

  async getSale(id) {
    const response = await api.get(`/sales/${id}`)
    return response.data
  }

  async getSaleByInvoice(invoiceNo) {
    const response = await api.get(`/sales/invoice/${invoiceNo}`)
    return response.data
  }

  async createSale(saleData) {
    const response = await api.post('/sales', saleData)
    return response.data
  }

  async voidSale(id, reason) {
    const response = await api.post(`/sales/${id}/void`, { reason })
    return response.data
  }

  async getDailySummary(date) {
    const response = await api.get('/sales/summary/daily', {
      params: { date }
    })
    return response.data
  }

  async getSalesAnalytics(period = 'month') {
    const response = await api.get('/sales/analytics', {
      params: { period }
    })
    return response.data
  }

  async printInvoice(id) {
    const response = await api.get(`/sales/${id}/print`, {
      responseType: 'blob'
    })
    return response.data
  }

  async sendInvoiceByEmail(id, email) {
    const response = await api.post(`/sales/${id}/email`, { email })
    return response.data
  }
}

export default new SaleService()
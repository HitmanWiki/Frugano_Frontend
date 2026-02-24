import api from './api'

class ProductService {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params })
    return response.data
  }

  async getProduct(id) {
    const response = await api.get(`/products/${id}`)
    return response.data
  }

  async createProduct(productData) {
    const response = await api.post('/products', productData)
    return response.data
  }

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  }

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`)
    return response.data
  }

  async updateStock(id, stockData) {
    const response = await api.patch(`/products/${id}/stock`, stockData)
    return response.data
  }

  async bulkCreateProducts(products) {
    const response = await api.post('/products/bulk', { products })
    return response.data
  }

  async getLowStock() {
    const response = await api.get('/products', {
      params: { lowStock: true }
    })
    return response.data
  }

  async searchProducts(query) {
    const response = await api.get('/products', {
      params: { search: query, limit: 10 }
    })
    return response.data
  }
}

export default new ProductService()
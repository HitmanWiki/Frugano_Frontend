import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get('/products', { params }).then(res => res.data)
  })
}

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`).then(res => res.data),
    enabled: !!id
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productData) => api.post('/products', productData),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create product')
    }
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/products/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['products', variables.id])
      toast.success('Product updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update product')
    }
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete product')
    }
  })
}

export const useUpdateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/products/${id}/stock`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['products', variables.id])
      queryClient.invalidateQueries(['inventory'])
      toast.success('Stock updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update stock')
    }
  })
}
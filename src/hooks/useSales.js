import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useSales = (params = {}) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => api.get('/sales', { params }).then(res => res.data)
  })
}

export const useSale = (id) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.get(`/sales/${id}`).then(res => res.data),
    enabled: !!id
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (saleData) => api.post('/sales', saleData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['sales'])
      queryClient.invalidateQueries(['dashboard'])
      queryClient.invalidateQueries(['products'])
      toast.success('Sale completed successfully')
      return response.data
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to complete sale')
    }
  })
}

export const useVoidSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => api.post(`/sales/${id}/void`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['sales'])
      queryClient.invalidateQueries(['sales', id])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Sale voided successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to void sale')
    }
  })
}

export const useDailySummary = (date) => {
  return useQuery({
    queryKey: ['sales', 'daily', date],
    queryFn: () => api.get('/sales/summary/daily', { params: { date } }).then(res => res.data)
  })
}
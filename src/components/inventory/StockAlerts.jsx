import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const StockAlerts = () => {
  const [filter, setFilter] = useState('ACTIVE')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['stock-alerts', filter],
    queryFn: () => api.get('/inventory/alerts', {
      params: { status: filter !== 'ALL' ? filter : undefined }
    }).then(res => res.data)
  })

  const resolveMutation = useMutation({
    mutationFn: (id) => api.patch(`/inventory/alerts/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-alerts'])
      toast.success('Alert resolved')
    },
    onError: (error) => {
      toast.error('Failed to resolve alert')
    }
  })

  const refreshMutation = useMutation({
    mutationFn: () => api.post('/inventory/alerts/check'),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-alerts'])
      toast.success('Alerts refreshed')
    }
  })

  if (isLoading) return <Loader />

  const alerts = data?.data || []

  const getAlertIcon = (status) => {
    switch(status) {
      case 'ACTIVE':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'RESOLVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Stock Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor and manage low stock notifications</p>
        </div>
        
        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isLoading}
          className="btn-secondary inline-flex items-center disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshMutation.isLoading ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="flex space-x-2">
          {['ACTIVE', 'RESOLVED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? status === 'ACTIVE' ? 'bg-yellow-500 text-white' :
                    status === 'RESOLVED' ? 'bg-green-500 text-white' :
                    'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    alert.status === 'ACTIVE' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {getAlertIcon(alert.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {alert.product?.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        alert.status === 'ACTIVE' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>Current: {alert.currentStock} {alert.product?.unit}</span>
                      <span>Minimum: {alert.minStockLevel} {alert.product?.unit}</span>
                      <span>Shortage: {alert.minStockLevel - alert.currentStock} {alert.product?.unit}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Created: {format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                      {alert.resolvedAt && (
                        <span>Resolved: {format(new Date(alert.resolvedAt), 'dd/MM/yyyy HH:mm')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {alert.status === 'ACTIVE' && (
                  <button
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isLoading}
                    className="btn-outline text-sm py-1 px-3"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {alerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium text-gray-900 mb-1">No Alerts</p>
            <p className="text-sm text-gray-600">All stock levels are healthy</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StockAlerts
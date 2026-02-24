import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import Loader from '../common/Loader'

const movementTypes = [
  { value: 'PURCHASE', label: 'Purchase', color: 'bg-green-100 text-green-800' },
  { value: 'SALE', label: 'Sale', color: 'bg-blue-100 text-blue-800' },
  { value: 'ADJUSTMENT', label: 'Adjustment', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'WASTAGE', label: 'Wastage', color: 'bg-red-100 text-red-800' },
  { value: 'RETURN', label: 'Return', color: 'bg-purple-100 text-purple-800' },
]

const InventoryMovements = () => {
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-movements', page, type, search, startDate, endDate],
    queryFn: () => api.get('/inventory/transactions', {
      params: {
        page,
        limit,
        type,
        search,
        startDate,
        endDate
      }
    }).then(res => res.data)
  })

  if (isLoading) return <Loader />

  const movements = data?.data || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  const getMovementIcon = (type) => {
    switch(type) {
      case 'PURCHASE':
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />
      case 'SALE':
        return <ArrowUpIcon className="h-5 w-5 text-blue-600" />
      default:
        return <ArrowUpIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getMovementColor = (type) => {
    const movement = movementTypes.find(m => m.value === type)
    return movement?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Inventory Movements</h1>
        <p className="text-gray-600 mt-1">Track all stock movements and transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product or reference..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline inline-flex items-center sm:w-auto"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movement Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                {movementTypes.map(mt => (
                  <option key={mt.value} value={mt.value}>{mt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Movements Timeline */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {movements.map((movement, index) => (
              <motion.li
                key={movement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    movement.type === 'PURCHASE' ? 'bg-green-100' :
                    movement.type === 'SALE' ? 'bg-blue-100' :
                    movement.type === 'WASTAGE' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {getMovementIcon(movement.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {movement.product?.name || 'Unknown Product'}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.type)}`}>
                        {movement.type}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>Qty: {movement.quantity} {movement.product?.unit}</span>
                      <span>Before: {movement.beforeStock}</span>
                      <span>After: {movement.afterStock}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                        {movement.reference && (
                          <span>Ref: {movement.reference}</span>
                        )}
                        {movement.notes && (
                          <span className="text-gray-500">Note: {movement.notes}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        by {movement.createdBy?.name || 'System'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Empty State */}
        {movements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No inventory movements found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} movements
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm">
                  {page}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default InventoryMovements
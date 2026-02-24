import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import Loader from '../common/Loader'

const PurchaseList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', page, search, status, startDate, endDate],
    queryFn: () => api.get('/purchases', {
      params: {
        page,
        limit,
        search,
        paymentStatus: status,
        startDate,
        endDate
      }
    }).then(res => res.data)
  })

  if (isLoading) return <Loader />

  const purchases = data?.data || []
  const pagination = data?.pagination || { total: 0, pages: 1 }
  const summary = data?.summary || {}

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600 mt-1">Manage supplier purchases and stock intake</p>
        </div>
        
        <Link
          to="/purchases/new"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Purchase
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
          <p className="text-2xl font-bold text-primary-600">{summary.totalPurchases || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-primary-600">₹{(summary.totalAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Total Discount</p>
          <p className="text-2xl font-bold text-primary-600">₹{(summary.totalDiscount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Net Amount</p>
          <p className="text-2xl font-bold text-primary-600">₹{(summary.netAmount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice or supplier..."
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
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
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

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Invoice No.</th>
                <th className="table-header">Date</th>
                <th className="table-header">Supplier</th>
                <th className="table-header">Items</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <motion.tr
                  key={purchase.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/purchases/${purchase.id}`)}
                >
                  <td className="table-cell font-mono text-sm font-medium">
                    {purchase.invoiceNo}
                  </td>
                  <td className="table-cell">
                    {format(new Date(purchase.purchaseDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {purchase.supplier?.name}
                      </p>
                      <p className="text-xs text-gray-500">{purchase.supplier?.phone}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {purchase.items.length} items
                    </span>
                  </td>
                  <td className="table-cell font-semibold">
                    ₹{purchase.netAmount.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.paymentStatus)}`}>
                      {purchase.paymentStatus}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/purchases/${purchase.id}`)
                      }}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {purchases.length === 0 && (
          <div className="text-center py-12">
            <CurrencyRupeeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-1">No purchases found</p>
            <p className="text-sm text-gray-600 mb-4">Record your first supplier purchase</p>
            <Link to="/purchases/new" className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Purchase
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} purchases
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

export default PurchaseList
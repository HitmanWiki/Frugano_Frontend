import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import Loader from '../common/Loader'

const SaleList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, search, startDate, endDate, paymentMethod],
    queryFn: () => api.get('/sales', { 
      params: { 
        page, 
        limit, 
        search,
        startDate,
        endDate,
        paymentMethod
      } 
    }).then(res => res.data)
  })

  const handlePrintInvoice = (saleId) => {
    window.open(`/api/sales/${saleId}/print`, '_blank')
  }

  if (isLoading) return <Loader />

  const sales = data?.data || []
  const pagination = data?.pagination || { total: 0, pages: 1 }
  const summary = data?.summary || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600 mt-1">View and manage all sales transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600">Total Sales</p>
          <p className="text-2xl font-bold text-primary-600">{summary.totalSales || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-primary-600">₹{summary.totalRevenue?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600">Average Ticket</p>
          <p className="text-2xl font-bold text-primary-600">₹{summary.averageTicket?.toFixed(2) || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600">Total Discount</p>
          <p className="text-2xl font-bold text-primary-600">₹{summary.totalDiscount?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="input-field pl-10"
            />
          </div>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              placeholder="Start Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
              placeholder="End Date"
            />
          </div>
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input-field"
            >
              <option value="">All Payments</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Invoice No.</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total</th>
                <th className="table-header">Payment</th>
                <th className="table-header">Cashier</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/sales/${sale.id}`)}
                >
                  <td className="table-cell font-mono text-sm font-medium">
                    {sale.invoiceNo}
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="text-sm text-gray-900">
                        {format(new Date(sale.saleDate), 'dd/MM/yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(sale.saleDate), 'hh:mm a')}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    {sale.customerName || (
                      <span className="text-gray-400">Walk-in</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {sale.items.length} items
                    </span>
                  </td>
                  <td className="table-cell font-semibold">
                    ₹{sale.totalAmount.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800' :
                      sale.paymentMethod === 'CARD' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="table-cell">
                    {sale.cashier?.name || 'Unknown'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/sales/${sale.id}`)
                        }}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrintInvoice(sale.id)
                        }}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Print Invoice"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCartIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium mb-1">No sales found</p>
                    <p className="text-sm">Sales will appear here once you make your first sale</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
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

export default SaleList
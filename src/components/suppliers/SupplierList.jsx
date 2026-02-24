import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const SupplierList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => api.get('/suppliers', { 
      params: { page, limit, search }
    }).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers'])
      toast.success('Supplier deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete supplier')
    }
  })

  const handleDelete = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${name}"?`)) return
    deleteMutation.mutate(id)
  }

  if (isLoading) return <Loader />

  const suppliers = data?.data || []
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships</p>
        </div>
        
        <Link
          to="/suppliers/new"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Supplier
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Total Suppliers</p>
          <p className="text-2xl font-bold text-primary-600">{summary.totalSuppliers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-yellow-600">₹{(summary.totalBalance || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <p className="text-sm text-gray-600 mb-1">Opening Balance</p>
          <p className="text-2xl font-bold text-gray-900">₹{(summary.totalOpeningBalance || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <input
          type="text"
          placeholder="Search suppliers by name, phone, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="input-field w-full"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-card p-6 hover:shadow-hover transition-all cursor-pointer"
            onClick={() => navigate(`/suppliers/${supplier.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/suppliers/${supplier.id}/edit`)
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(supplier.id, supplier.name)
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
              {supplier.name}
            </h3>

            <div className="space-y-2 mb-4">
              {supplier.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {supplier.email}
                </div>
              )}
              {supplier.gstNumber && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-mono text-xs">GST: {supplier.gstNumber}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Current Balance</p>
                  <p className={`text-lg font-bold ${
                    supplier.currentBalance > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    ₹{supplier.currentBalance.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Purchases</p>
                  <p className="text-lg font-bold text-gray-900">{supplier._count?.purchases || 0}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-1">No suppliers found</p>
          <p className="text-sm text-gray-600 mb-4">Add your first supplier to start tracking purchases</p>
          <Link to="/suppliers/new" className="btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Supplier
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
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
      )}
    </motion.div>
  )
}

export default SupplierList
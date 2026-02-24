import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  ArchiveBoxIcon,
  TagIcon,
  CubeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import StockManagement from './StockManagement'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showStockModal, setShowStockModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product deleted successfully')
      navigate('/products')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete product')
    }
  })

  if (isLoading) return <Loader />

  const product = data?.data

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate()
    }
  }

  const stats = [
    {
      label: 'Total Sold',
      value: product.statistics?.totalSold || 0,
      unit: product.unit,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Revenue',
      value: `₹${(product.statistics?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
    },
    {
      label: 'Total Purchased',
      value: product.statistics?.totalPurchased || 0,
      unit: product.unit,
      icon: ArchiveBoxIcon,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Wastage',
      value: product.statistics?.totalWastage || 0,
      unit: product.unit,
      icon: TagIcon,
      color: 'bg-red-500',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Product Details
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="btn-secondary inline-flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger inline-flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-primary-100 rounded-xl">
            <CubeIcon className="h-12 w-12 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              {product.name}
            </h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">SKU</p>
                <p className="text-sm font-medium text-gray-900">{product.sku}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium text-gray-900">{product.category?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unit</p>
                <p className="text-sm font-medium text-gray-900">{product.unit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Barcode</p>
                <p className="text-sm font-medium text-gray-900">{product.barcode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Pricing Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
            <p className="text-lg font-bold text-gray-900">₹{product.purchasePrice}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Selling Price</p>
            <p className="text-lg font-bold text-primary-600">₹{product.sellingPrice}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">MRP</p>
            <p className="text-lg font-bold text-gray-900">₹{product.mrp || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Tax Rate</p>
            <p className="text-lg font-bold text-gray-900">{product.taxRate}%</p>
          </div>
        </div>
      </div>

      {/* Stock Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-gray-900">
            Stock Information
          </h3>
          <button
            onClick={() => setShowStockModal(true)}
            className="btn-primary text-sm"
          >
            Update Stock
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Current Stock</p>
            <p className={`text-2xl font-bold ${
              product.currentStock <= product.minStockAlert 
                ? 'text-yellow-600' 
                : 'text-green-600'
            }`}>
              {product.currentStock} {product.unit}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Minimum Alert</p>
            <p className="text-2xl font-bold text-gray-900">
              {product.minStockAlert} {product.unit}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-2xl font-bold">
              <span className={`px-3 py-1 rounded-full text-sm ${
                product.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 text-white p-1 rounded ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">
                {stat.value} {stat.unit || ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Management Modal */}
      {showStockModal && (
        <StockManagement
          product={product}
          onClose={() => setShowStockModal(false)}
        />
      )}
    </motion.div>
  )
}

export default ProductDetails
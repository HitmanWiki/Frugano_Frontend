import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import Loader from '../common/Loader'

const InventoryStatus = () => {
  const [view, setView] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-status'],
    queryFn: () => api.get('/inventory/status').then(res => res.data)
  })

  const { data: products } = useQuery({
    queryKey: ['products', view],
    queryFn: () => api.get('/products', {
      params: {
        limit: 100,
        lowStock: view === 'low' ? true : undefined,
        isActive: true
      }
    }).then(res => res.data)
  })

  if (isLoading) return <Loader />

  const status = data?.data
  const productList = products?.data || []

  const stats = [
    {
      title: 'Total Products',
      value: status?.valuation?.totalProducts || 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Inventory Value',
      value: `₹${(status?.valuation?.costValue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Low Stock Items',
      value: status?.lowStock?.count || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Out of Stock',
      value: status?.outOfStock?.count || 0,
      icon: CheckCircleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Inventory Status</h1>
        <p className="text-gray-600 mt-1">Monitor stock levels and inventory value</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-heading font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Valuation Summary */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Inventory Valuation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Cost Value</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{(status?.valuation?.costValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Retail Value</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{(status?.valuation?.retailValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Potential Profit</p>
            <p className="text-xl font-bold text-green-600">
              ₹{(status?.valuation?.potentialProfit || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-gray-900">
              Product Stock Levels
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setView('low')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'low'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Low Stock
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {productList.map((product) => {
            const stockPercentage = (product.currentStock / product.minStockAlert) * 100
            const isLowStock = product.currentStock <= product.minStockAlert

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {product.currentStock} {product.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {product.minStockAlert} {product.unit}
                    </p>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Stock Level</span>
                    <span className={isLowStock ? 'text-yellow-600 font-medium' : 'text-gray-600'}>
                      {Math.min(100, Math.round(stockPercentage))}%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, stockPercentage)}%` }}
                      transition={{ duration: 1 }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        isLowStock ? 'bg-yellow-500' : 'bg-primary-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default InventoryStatus
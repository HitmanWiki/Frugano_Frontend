import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const units = [
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'GRAM', label: 'Gram (g)' },
  { value: 'PIECE', label: 'Piece' },
  { value: 'DOZEN', label: 'Dozen' },
  { value: 'BUNDLE', label: 'Bundle' },
  { value: 'PACKET', label: 'Packet' },
]

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!!id)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data)
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const isOrganic = watch('isOrganic')

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      const product = response.data.data
      reset({
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        categoryId: product.categoryId,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        unit: product.unit,
        taxRate: product.taxRate,
        minStockAlert: product.minStockAlert,
        currentStock: product.currentStock,
        isOrganic: product.isOrganic,
        isSeasonal: product.isSeasonal,
        season: product.season,
        expiryDays: product.expiryDays,
      })
    } catch (error) {
      toast.error('Failed to fetch product details')
      navigate('/products')
    } finally {
      setFetchLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        await api.put(`/products/${id}`, data)
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', data)
        toast.success('Product created successfully')
      }
      navigate('/products')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Fresh Apples"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('sku', { required: 'SKU is required' })}
                className={`input-field ${errors.sku ? 'border-red-500' : ''}`}
                placeholder="APP-001"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className={`input-field ${errors.categoryId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a category</option>
                {categories?.data?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                {...register('unit', { required: 'Unit is required' })}
                className={`input-field ${errors.unit ? 'border-red-500' : ''}`}
              >
                <option value="">Select unit</option>
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows="3"
                className="input-field"
                placeholder="Product description..."
              />
            </div>

            {/* Pricing */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                Pricing & Inventory
              </h2>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('purchasePrice', { 
                  required: 'Purchase price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className={`input-field ${errors.purchasePrice ? 'border-red-500' : ''}`}
                placeholder="80.00"
              />
              {errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('sellingPrice', { 
                  required: 'Selling price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className={`input-field ${errors.sellingPrice ? 'border-red-500' : ''}`}
                placeholder="120.00"
              />
              {errors.sellingPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.sellingPrice.message}</p>
              )}
            </div>

            {/* MRP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MRP (₹)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('mrp')}
                className="input-field"
                placeholder="140.00"
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('taxRate')}
                className="input-field"
                placeholder="5"
              />
            </div>

            {/* Stock Management */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                Stock Management
              </h2>
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock
              </label>
              <input
                type="number"
                step="0.01"
                {...register('currentStock')}
                className="input-field"
                placeholder="100"
              />
            </div>

            {/* Minimum Stock Alert */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Alert
              </label>
              <input
                type="number"
                step="0.01"
                {...register('minStockAlert')}
                className="input-field"
                placeholder="10"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode
              </label>
              <input
                type="text"
                {...register('barcode')}
                className="input-field"
                placeholder="8901234567890"
              />
            </div>

            {/* Expiry Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelf Life (days)
              </label>
              <input
                type="number"
                {...register('expiryDays')}
                className="input-field"
                placeholder="30"
              />
            </div>

            {/* Additional Options */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                Additional Options
              </h2>
            </div>

            {/* Organic */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isOrganic')}
                id="isOrganic"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isOrganic" className="text-sm text-gray-700">
                Organic Product
              </label>
            </div>

            {/* Seasonal */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isSeasonal')}
                id="isSeasonal"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isSeasonal" className="text-sm text-gray-700">
                Seasonal Product
              </label>
            </div>

            {/* Season (if seasonal) */}
            {isOrganic && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season
                </label>
                <input
                  type="text"
                  {...register('season')}
                  className="input-field"
                  placeholder="Summer, Winter, etc."
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default ProductForm
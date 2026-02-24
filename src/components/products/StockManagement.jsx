import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const StockManagement = ({ product, onClose }) => {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: '',
      type: 'ADD',
      notes: '',
    }
  })

  const type = watch('type')

  const mutation = useMutation({
    mutationFn: (data) => api.patch(`/products/${product.id}/stock`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['products', product.id])
      queryClient.invalidateQueries(['inventory'])
      toast.success('Stock updated successfully')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update stock')
      setLoading(false)
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    mutation.mutate({
      quantity: parseFloat(data.quantity),
      type: data.type,
      notes: data.notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-gray-900">
              Update Stock - {product.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Current Stock Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
            <p className="text-2xl font-bold text-primary-600">
              {product.currentStock} {product.unit}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Min Alert: {product.minStockAlert} {product.unit}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Stock Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation Type
              </label>
              <select
                {...register('type')}
                className="input-field"
              >
                <option value="ADD">Add Stock</option>
                <option value="REMOVE">Remove Stock</option>
                <option value="SET">Set Stock</option>
                <option value="WASTE">Wastage</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0.01, message: 'Quantity must be positive' }
                })}
                className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows="3"
                className="input-field"
                placeholder={type === 'ADD' ? 'Restock from supplier' : 
                           type === 'REMOVE' ? 'Sold to customer' :
                           type === 'WASTE' ? 'Spoiled/expired items' : 
                           'Stock adjustment reason'}
              />
            </div>

            {/* Warning for removal */}
            {type === 'REMOVE' && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ Removing stock will deduct from current inventory. Make sure this is a valid sale or adjustment.
                </p>
              </div>
            )}

            {/* Warning for wastage */}
            {type === 'WASTE' && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-800">
                  ⚠️ Wastage records items that are spoiled, damaged, or expired. This will be tracked separately.
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default StockManagement
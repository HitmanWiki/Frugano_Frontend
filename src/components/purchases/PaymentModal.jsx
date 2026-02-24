import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PaymentModal = ({ purchase, onClose }) => {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const totalPaid = purchase.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const remainingBalance = purchase.netAmount - totalPaid

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: remainingBalance,
      paymentMethod: 'CASH',
      referenceNo: '',
      notes: '',
    }
  })

  const amount = watch('amount')

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/purchases/${purchase.id}/payments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases'])
      queryClient.invalidateQueries(['purchases', purchase.id])
      toast.success('Payment added successfully')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add payment')
      setLoading(false)
    }
  })

  const onSubmit = async (data) => {
    if (parseFloat(data.amount) > remainingBalance) {
      toast.error(`Amount exceeds remaining balance of ₹${remainingBalance}`)
      return
    }

    setLoading(true)
    mutation.mutate({
      amount: parseFloat(data.amount),
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo,
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
              Add Payment
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Balance Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Invoice Total:</span>
              <span className="font-medium">₹{purchase.netAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-medium text-green-600">₹{totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span className="text-gray-900">Remaining:</span>
              <span className="text-primary-600">₹{remainingBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be positive' }
                })}
                className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                {...register('paymentMethod')}
                className="input-field"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                {...register('referenceNo')}
                className="input-field"
                placeholder="Cheque/Transaction number"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows="2"
                className="input-field"
                placeholder="Additional notes..."
              />
            </div>

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
                {loading ? 'Processing...' : 'Add Payment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentModal
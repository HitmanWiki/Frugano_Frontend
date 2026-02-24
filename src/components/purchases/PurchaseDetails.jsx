import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import PaymentModal from './PaymentModal'

const PurchaseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', id],
    queryFn: () => api.get(`/purchases/${id}`).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases'])
      toast.success('Purchase deleted successfully')
      navigate('/purchases')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete purchase')
    }
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deleteMutation.mutate()
    }
  }

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

  if (isLoading) return <Loader />

  const purchase = data?.data

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
            onClick={() => navigate('/purchases')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              Purchase Details
            </h1>
            <p className="text-sm text-gray-500">Invoice: {purchase.invoiceNo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/purchases/${id}/edit`)}
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

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              purchase.paymentStatus === 'PAID' ? 'bg-green-100' :
              purchase.paymentStatus === 'PARTIAL' ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              <CurrencyRupeeIcon className={`h-6 w-6 ${
                purchase.paymentStatus === 'PAID' ? 'text-green-600' :
                purchase.paymentStatus === 'PARTIAL' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.paymentStatus)}`}>
                {purchase.paymentStatus}
              </span>
            </div>
          </div>

          {purchase.paymentStatus !== 'PAID' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary"
            >
              Add Payment
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">₹{purchase.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Discount</p>
            <p className="text-lg font-bold text-gray-900">₹{purchase.discount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Tax</p>
            <p className="text-lg font-bold text-gray-900">₹{purchase.taxAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Net Amount</p>
            <p className="text-lg font-bold text-primary-600">₹{purchase.netAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Supplier Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">{purchase.supplier?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TruckIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{purchase.supplier?.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Purchase Date</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(purchase.purchaseDate), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Items
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchase.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.product?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {item.quantity} {item.product?.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{item.purchasePrice}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    ₹{item.total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-bold text-primary-600 text-right">
                  ₹{purchase.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment History */}
      {purchase.payments?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Payment History
          </h2>
          <div className="space-y-3">
            {purchase.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">₹{payment.amount}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{payment.paymentMethod}</p>
                  {payment.referenceNo && (
                    <p className="text-xs text-gray-500">Ref: {payment.referenceNo}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {purchase.notes && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
            Notes
          </h2>
          <p className="text-sm text-gray-600">{purchase.notes}</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          purchase={purchase}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </motion.div>
  )
}

export default PurchaseDetails
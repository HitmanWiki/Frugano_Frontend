import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  UserIcon,
  CalendarIcon,
  ShoppingBagIcon,
  PhoneIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import api from '../../services/api'
import whatsappService from '../../services/whatsapp.service'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import { useTheme } from '../../contexts/ThemeContext'
import PrintButton from '../common/PrintButton'
import UPIPaymentModal from './UPIPaymentModal'

const SaleDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [showUPIModal, setShowUPIModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.get(`/sales/${id}`).then(res => res.data)
  })

  const voidMutation = useMutation({
    mutationFn: (reason) => api.post(`/sales/${id}/void`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sales'])
      queryClient.invalidateQueries(['sales', id])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Sale voided successfully')
      setShowVoidConfirm(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to void sale')
    }
  })

  const handleVoid = (reason) => {
    voidMutation.mutate(reason)
  }

  const handlePrintInvoice = async () => {
    setPrinting(true)
    try {
      // Try to print directly via thermal printer
      const response = await api.post(`/print/invoice/${id}`).catch(() => {
        // Fallback to PDF download
        window.open(`/api/sales/${id}/print`, '_blank')
      })
      
      if (response?.data?.success) {
        toast.success('Invoice sent to printer')
      }
    } catch (error) {
      // Fallback to PDF
      window.open(`/api/sales/${id}/print`, '_blank')
    } finally {
      setPrinting(false)
    }
  }

  const handleWhatsApp = async () => {
    if (!sale?.customerPhone) {
      toast.error('No phone number available for this customer')
      return
    }

    if (!whatsappService.validatePhoneNumber(sale.customerPhone)) {
      toast.error('Invalid phone number format')
      return
    }

    setSendingWhatsApp(true)
    try {
      const result = await whatsappService.sendBill(sale.customerPhone, sale)
      
      if (result.mock) {
        toast.success(`📱 WhatsApp bill sent (Demo) from ${whatsappService.getBusinessNumber()}`)
        console.log('📱 WhatsApp message would be sent from:', whatsappService.getBusinessNumber())
        console.log('📱 To:', sale.customerPhone)
      } else {
        toast.success('Bill sent via WhatsApp!')
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message')
    } finally {
      setSendingWhatsApp(false)
    }
  }

  const handleUPIPayment = () => {
    setShowUPIModal(true)
  }

  const handleUPIPaymentComplete = (paid) => {
    setShowUPIModal(false)
    if (paid) {
      // Refresh sale data
      queryClient.invalidateQueries(['sales', id])
      toast.success('Payment recorded successfully')
    }
  }

  if (isLoading) return <Loader />

  const sale = data?.data

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className={`${theme.text.secondary}`}>Sale not found</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

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
            onClick={() => navigate('/sales')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className={`h-5 w-5 ${theme.text.secondary}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-heading font-bold ${theme.text.primary}`}>
              Sale Details
            </h1>
            <p className={`text-sm ${theme.text.secondary}`}>Invoice: {sale.invoiceNo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* UPI QR Button - Show for pending payments */}
          {sale.paymentStatus === 'PENDING' && (
            <button
              onClick={handleUPIPayment}
              className="btn-secondary inline-flex items-center"
              title="Generate UPI QR Code"
            >
              <QrCodeIcon className="h-4 w-4 mr-2" />
              UPI QR
            </button>
          )}

          {/* Print Button */}
          <button
            onClick={handlePrintInvoice}
            disabled={printing}
            className="btn-secondary inline-flex items-center"
            title="Print Invoice"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            {printing ? 'Printing...' : 'Print'}
          </button>

          {/* WhatsApp Button */}
          {sale.customerPhone && sale.paymentStatus !== 'CANCELLED' && (
            <button
              onClick={handleWhatsApp}
              disabled={sendingWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center disabled:opacity-50 transition-colors"
              title="Send bill via WhatsApp"
            >
              {sendingWhatsApp ? (
                <>
                  <div className="loader-small mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  WhatsApp
                </>
              )}
            </button>
          )}
          
          {/* Void Button */}
          {sale.paymentStatus !== 'CANCELLED' && (
            <button
              onClick={() => setShowVoidConfirm(true)}
              className="btn-danger inline-flex items-center"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Void
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              sale.paymentStatus === 'PAID' ? 'bg-green-100 dark:bg-green-900' :
              sale.paymentStatus === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900' :
              'bg-yellow-100 dark:bg-yellow-900'
            }`}>
              <CurrencyRupeeIcon className={`h-6 w-6 ${
                sale.paymentStatus === 'PAID' ? 'text-green-600 dark:text-green-400' :
                sale.paymentStatus === 'CANCELLED' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Payment Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.paymentStatus)}`}>
                {sale.paymentStatus}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-sm ${theme.text.secondary} mb-1`}>Total Amount</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ₹{sale.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className={`text-xs ${theme.text.secondary} mb-1`}>Subtotal</p>
            <p className={`text-lg font-semibold ${theme.text.primary}`}>₹{sale.subtotal.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-xs ${theme.text.secondary} mb-1`}>Discount</p>
            <p className={`text-lg font-semibold ${theme.text.primary}`}>₹{sale.discount.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-xs ${theme.text.secondary} mb-1`}>Tax</p>
            <p className={`text-lg font-semibold ${theme.text.primary}`}>₹{sale.taxAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-xs ${theme.text.secondary} mb-1`}>Payment Method</p>
            <p className={`text-lg font-semibold ${theme.text.primary}`}>{sale.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
        <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
          Customer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Name</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>
                {sale.customerName || 'Walk-in Customer'}
              </p>
            </div>
          </div>
          
          {sale.customerPhone && (
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className={`text-sm ${theme.text.secondary}`}>Phone</p>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${theme.text.primary}`}>
                    {sale.customerPhone}
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    disabled={sendingWhatsApp}
                    className="text-green-500 hover:text-green-600 ml-2"
                    title="Send via WhatsApp"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Sale Date</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>
                {format(new Date(sale.saleDate), 'dd/MM/yyyy hh:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Cashier</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>
                {sale.cashier?.name || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
        <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
          Items
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={theme.table.header}>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium">Product</th>
                <th className="px-4 py-2 text-center text-xs font-medium">Quantity</th>
                <th className="px-4 py-2 text-right text-xs font-medium">Unit Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {item.product?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                    {item.quantity} {item.product?.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    ₹{item.sellingPrice}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                    ₹{item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Info Banner */}
      {sale.customerPhone && (
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                WhatsApp Bill Ready
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Bill will be sent from: {whatsappService.getBusinessNumber()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                To: {sale.customerPhone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      <UPIPaymentModal
        isOpen={showUPIModal}
        onClose={handleUPIPaymentComplete}
        sale={sale}
        amount={sale.totalAmount}
        orderId={sale.invoiceNo}
      />

      {/* Void Confirmation Modal */}
      {showVoidConfirm && (
        <VoidConfirmModal
          onConfirm={handleVoid}
          onClose={() => setShowVoidConfirm(false)}
          loading={voidMutation.isLoading}
        />
      )}
    </motion.div>
  )
}

// Void Confirmation Modal
const VoidConfirmModal = ({ onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('')
  const theme = useTheme()

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative ${theme.bg.card} rounded-xl shadow-xl max-w-md w-full p-6 z-10`}
        >
          <h2 className={`text-xl font-heading font-bold ${theme.text.primary} mb-4`}>
            Void Sale
          </h2>
          
          <p className={`text-sm ${theme.text.secondary} mb-4`}>
            Are you sure you want to void this sale? This action cannot be undone.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Reason for voiding
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="input-field"
                placeholder="Enter reason..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason}
                className="btn-danger disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Void Sale'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default SaleDetails
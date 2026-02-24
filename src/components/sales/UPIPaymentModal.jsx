import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCodeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const UPIPaymentModal = ({ isOpen, onClose, amount, orderId }) => {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    if (isOpen && amount > 0) {
      generateQRCode()
    }
  }, [isOpen, amount])

  useEffect(() => {
    if (paymentStatus === 'pending' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setPaymentStatus('expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [paymentStatus, timeLeft])

  // ✅ FIXED: Using POST instead of GET
  const generateQRCode = async () => {
    setLoading(true)
    try {
      const response = await api.post('/upi/generate-amount', {
        amount,
        orderId: orderId || `ORDER${Date.now()}`
      })
      setQrData(response.data.data)
    } catch (error) {
      console.error('QR generation error:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    // Print logic here
  }

  const handleDownload = () => {
    // Download logic here
  }

  const handlePaymentSuccess = () => {
    setPaymentStatus('paid')
    toast.success('Payment recorded successfully')
    setTimeout(() => onClose(true), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal content - same as before */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onClose(false)} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              UPI Payment
            </h2>
            <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="loader mb-4"></div>
              <p className="text-gray-600">Generating QR Code...</p>
            </div>
          ) : qrData ? (
            <div className="space-y-4">
              {/* QR Code Image */}
              <div className="flex justify-center">
                <img src={qrData.qrCode} alt="UPI QR Code" className="w-64 h-64" />
              </div>

              {/* Amount */}
              <div className="text-center">
                <p className="text-sm text-gray-600">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary-600">₹{qrData.amount}</p>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <ClockIcon className="h-5 w-5" />
                <span className="font-mono text-lg">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>

              {/* UPI Details */}
              <div className="text-center text-sm text-gray-600">
                <p>UPI ID: {qrData.upiId}</p>
                <p>Order: {qrData.orderId}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-3">
                <button onClick={handlePrint} className="btn-secondary">
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button onClick={handleDownload} className="btn-secondary">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>

              {/* Payment Confirmation */}
              <button onClick={handlePaymentSuccess} className="w-full btn-primary mt-4">
                Confirm Payment Received
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-red-500">
              Failed to generate QR code
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default UPIPaymentModal
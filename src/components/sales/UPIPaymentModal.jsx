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

const UPIPaymentModal = ({ isOpen, onClose, sale, amount, orderId }) => {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, paid, expired
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

  useEffect(() => {
    if (isOpen) {
      generateQRCode()
    }
  }, [isOpen, amount, orderId])

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

  const generateQRCode = async () => {
    setLoading(true)
    try {
      let response
      if (sale) {
        // Generate QR for existing sale
        response = await api.post(`/upi/generate/${sale.id}`)
      } else {
        // Generate QR for custom amount
        response = await api.post('/upi/generate-amount', {
          amount,
          orderId: orderId || `POS${Date.now()}`
        })
      }
      setQrData(response.data.data)
    } catch (error) {
      toast.error('Failed to generate QR code')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (!qrData) return
    
    // Open print window
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>UPI QR Code</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .container { 
              text-align: center;
              max-width: 400px;
            }
            .qr-code { 
              margin: 20px auto;
              padding: 20px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .qr-code img {
              width: 250px;
              height: 250px;
            }
            .amount { 
              font-size: 28px; 
              font-weight: bold; 
              color: #1B4D3E;
              margin: 10px 0;
            }
            .upi-id { 
              color: #666; 
              margin: 10px 0;
              font-size: 14px;
            }
            .order-id {
              color: #999;
              font-size: 12px;
              margin-top: 10px;
            }
            .instructions {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              text-align: left;
              font-size: 13px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 20px;
              font-size: 11px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Scan to Pay via UPI</h2>
            <div class="qr-code">
              <img src="${qrData.qrCode}" alt="UPI QR Code" />
            </div>
            <div class="amount">₹${qrData.amount}</div>
            <div class="upi-id">UPI ID: ${qrData.upiId}</div>
            <div class="order-id">Order: ${qrData.orderId}</div>
            
            <div class="instructions">
              <strong>📱 How to Pay:</strong>
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li>Open any UPI app (Google Pay, PhonePe, Paytm)</li>
                <li>Scan this QR code</li>
                <li>Verify the amount and complete payment</li>
                <li>The cashier will confirm payment</li>
              </ul>
            </div>
            
            <div class="footer">
              ${qrData.merchantName} | Thank you for shopping!
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = () => {
    if (!qrData) return
    
    // Create download link
    const link = document.createElement('a')
    link.href = qrData.qrCode
    link.download = `upi-qr-${qrData.orderId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR Code downloaded')
  }

  const handlePaymentSuccess = () => {
    setPaymentStatus('paid')
    toast.success('Payment recorded successfully')
    
    // Close modal after 2 seconds
    setTimeout(() => {
      onClose(true) // Pass true to indicate payment completed
    }, 2000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onClose(false)} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              UPI Payment
            </h2>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="loader mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Generating QR Code...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {paymentStatus === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl">
                      <img
                        src={qrData.qrCode}
                        alt="UPI QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount to Pay</p>
                    <p className="text-3xl font-bold text-primary-600">₹{qrData.amount}</p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 text-orange-600">
                    <ClockIcon className="h-5 w-5" />
                    <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                  </div>

                  {/* UPI Details */}
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>UPI ID: {qrData.upiId}</p>
                    <p>Order: {qrData.orderId}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handlePrint}
                      className="btn-secondary inline-flex items-center"
                    >
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-secondary inline-flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>

                  {/* Payment Confirmation (for cashier) */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm font-medium mb-2">Cashier Actions:</p>
                    <button
                      onClick={handlePaymentSuccess}
                      className="w-full btn-primary"
                    >
                      Confirm Payment Received
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>💡 Ask customer to scan QR code with any UPI app</p>
                    <p>⏱️ QR code expires in 5 minutes</p>
                    <p>✅ Click confirm after payment is received</p>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'paid' && (
                <motion.div
                  key="paid"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Amount: ₹{qrData.amount}<br />
                    Order: {qrData.orderId}
                  </p>
                </motion.div>
              )}

              {paymentStatus === 'expired' && (
                <motion.div
                  key="expired"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <ClockIcon className="h-16 w-16 text-yellow-500 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    QR Code Expired
                  </p>
                  <button
                    onClick={generateQRCode}
                    className="btn-primary mt-4"
                  >
                    Generate New QR
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default UPIPaymentModal
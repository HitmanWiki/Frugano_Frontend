import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCodeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useTheme } from '../../contexts/ThemeContext'

const UPIQRCode = ({ 
  amount, 
  orderId, 
  customerName,
  onPaymentComplete,
  size = 250,
  showDetails = true 
}) => {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, verifying, success, failed
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const theme = useTheme()

  useEffect(() => {
    generateQR()
  }, [amount, orderId])

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

  const generateQR = async () => {
    setLoading(true)
    try {
      // For demo, generate QR data locally
      const upiId = 'store@frugano'
      const upiLink = `upi://pay?pa=${upiId}&pn=Frugano%20Store&am=${amount}&cu=INR&tn=Order%20${orderId}`
      
      setQrData({
        upiLink,
        amount,
        orderId,
        upiId
      })
    } catch (error) {
      console.error('QR generation error:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>UPI QR Code - Order ${orderId}</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .container { text-align: center; }
            .qr-code { margin: 20px auto; }
            .amount { font-size: 24px; font-weight: bold; color: #1B4D3E; }
            .upi-id { color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Scan to Pay</h2>
            <div class="qr-code">
              ${qrData?.qrCode || '<svg width="200" height="200">QR Code</svg>'}
            </div>
            <div class="amount">₹${amount}</div>
            <div class="upi-id">UPI ID: ${qrData?.upiId}</div>
            <div>Order: ${orderId}</div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = () => {
    if (!qrData) return
    
    const canvas = document.getElementById('qr-canvas')
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `qr-${orderId}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const simulatePayment = () => {
    setPaymentStatus('verifying')
    
    // Simulate payment verification
    setTimeout(() => {
      setPaymentStatus('success')
      toast.success('Payment successful!')
      if (onPaymentComplete) {
        onPaymentComplete({
          success: true,
          orderId,
          amount,
          transactionId: `TXN${Date.now()}`
        })
      }
    }, 2000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="loader"></div>
        <p className={`mt-4 ${theme.text.secondary}`}>Generating QR Code...</p>
      </div>
    )
  }

  return (
    <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
      <div className="text-center mb-4">
        <h3 className={`text-lg font-heading font-semibold ${theme.text.primary}`}>
          Scan to Pay via UPI
        </h3>
        <p className={`text-sm ${theme.text.secondary}`}>
          Use any UPI app to scan and pay
        </p>
      </div>

      <AnimatePresence mode="wait">
        {paymentStatus === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl mb-4">
              <QRCodeSVG
                id="qr-canvas"
                value={qrData.upiLink}
                size={size}
                level="H"
                includeMargin={true}
                fgColor="#1B4D3E"
              />
            </div>

            {/* Amount */}
            <div className="text-center mb-4">
              <p className={`text-sm ${theme.text.secondary}`}>Amount to Pay</p>
              <p className="text-3xl font-bold text-primary-600">₹{amount}</p>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-2 text-orange-600 mb-4">
              <ClockIcon className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>

            {/* UPI ID */}
            {showDetails && (
              <div className={`text-sm ${theme.text.secondary} mb-4`}>
                <p>UPI ID: {qrData.upiId}</p>
                <p>Order: {orderId}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
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

            {/* Simulate Payment Button (for demo) */}
            <button
              onClick={simulatePayment}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700"
            >
              Simulate Payment (Demo)
            </button>
          </motion.div>
        )}

        {paymentStatus === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            <div className="loader mb-4"></div>
            <p className={`text-lg font-medium ${theme.text.primary}`}>
              Verifying Payment...
            </p>
          </motion.div>
        )}

        {paymentStatus === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8"
          >
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
            <p className={`text-lg font-medium ${theme.text.primary} mb-2`}>
              Payment Successful!
            </p>
            <p className={`text-sm ${theme.text.secondary}`}>
              Transaction ID: TXN{Date.now()}
            </p>
          </motion.div>
        )}

        {paymentStatus === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8"
          >
            <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
            <p className={`text-lg font-medium ${theme.text.primary} mb-2`}>
              Payment Failed
            </p>
            <button
              onClick={() => setPaymentStatus('pending')}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
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
            <p className={`text-lg font-medium ${theme.text.primary} mb-2`}>
              QR Code Expired
            </p>
            <button
              onClick={() => {
                setPaymentStatus('pending')
                setTimeLeft(300)
                generateQR()
              }}
              className="btn-primary mt-4"
            >
              Generate New QR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Instructions */}
      <div className={`mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm ${theme.text.secondary}`}>
        <p className="font-medium mb-1">📱 How to Pay:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Open any UPI app (Google Pay, PhonePe, Paytm)</li>
          <li>Scan this QR code</li>
          <li>Verify the amount and complete payment</li>
          <li>Payment status will update automatically</li>
        </ul>
      </div>
    </div>
  )
}

export default UPIQRCode
import { useState } from 'react'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import UPIPaymentModal from './UPIPaymentModal'

const QuickUPI = ({ onPaymentComplete }) => {
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')

  const handleQuickPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter valid amount')
      return
    }
    setShowModal(true)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <h3 className="text-lg font-heading font-semibold mb-4">Quick UPI Payment</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Enter Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-field"
            min="0"
            step="0.01"
          />
        </div>

        <button
          onClick={handleQuickPayment}
          className="w-full btn-primary inline-flex items-center justify-center"
        >
          <QrCodeIcon className="h-5 w-5 mr-2" />
          Generate QR Code
        </button>
      </div>

      <UPIPaymentModal
        isOpen={showModal}
        onClose={(paid) => {
          setShowModal(false)
          if (paid) {
            setAmount('')
            if (onPaymentComplete) {
              onPaymentComplete(parseFloat(amount))
            }
          }
        }}
        amount={parseFloat(amount)}
        orderId={`QUICK${Date.now()}`}
      />
    </div>
  )
}

export default QuickUPI
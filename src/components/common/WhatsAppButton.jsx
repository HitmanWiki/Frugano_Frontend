import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import whatsappService from '../../services/whatsapp.service'
import toast from 'react-hot-toast'

const WhatsAppButton = ({ 
  phoneNumber, 
  saleData = null, 
  campaign = null,
  customerName = '',
  size = 'md',
  variant = 'floating' // 'floating' or 'inline'
}) => {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  // Size classes
  const sizes = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  }

  const handleSend = async () => {
    if (!phoneNumber) {
      toast.error('No phone number provided')
      return
    }

    if (!whatsappService.validatePhoneNumber(phoneNumber)) {
      toast.error('Invalid phone number format')
      return
    }

    setLoading(true)
    try {
      let result
      
      if (saleData) {
        // Send bill
        result = await whatsappService.sendBill(phoneNumber, saleData)
        toast.success('Bill sent via WhatsApp!')
      } else if (campaign) {
        // Send campaign offer
        result = await whatsappService.sendCampaignOffer(phoneNumber, campaign, customerName)
        toast.success('Campaign offer sent via WhatsApp!')
      } else if (customMessage) {
        // Send custom message
        result = await whatsappService.sendText(phoneNumber, customMessage)
        toast.success('Message sent via WhatsApp!')
      }

      if (result?.mock) {
        toast.success('(Demo mode) WhatsApp message logged to console')
      }
      
      setShowModal(false)
    } catch (error) {
      toast.error('Failed to send WhatsApp message')
    } finally {
      setLoading(false)
    }
  }

  const openWhatsApp = () => {
    if (variant === 'floating') {
      setShowModal(true)
    } else {
      handleSend()
    }
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-50"
          aria-label="WhatsApp"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>

        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-50"
                onClick={() => setShowModal(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="bg-green-500 p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                    <h3 className="text-white font-heading font-semibold">WhatsApp Message</h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4">
                  {saleData && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Sending invoice #{saleData.invoiceNo}
                      </p>
                    </div>
                  )}

                  {campaign && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Sending campaign: {campaign.name}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => phoneNumber = e.target.value}
                      className="input-field"
                      placeholder="9876543210"
                    />
                  </div>

                  {!saleData && !campaign && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows="4"
                        className="input-field"
                        placeholder="Type your message..."
                      />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={loading || (!saleData && !campaign && !customMessage)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Inline variant
  return (
    <button
      onClick={handleSend}
      disabled={loading || !phoneNumber}
      className={`inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
      {loading ? 'Sending...' : 'WhatsApp'}
    </button>
  )
}

export default WhatsAppButton
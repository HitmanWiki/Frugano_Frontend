import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  XMarkIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import UPIPaymentModal from './UPIPaymentModal'
import { useTheme } from '../../contexts/ThemeContext'
import QuickUPI from './QuickUPI'

const POS = () => {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showUPIModal, setShowUPIModal] = useState(false)
  const [upiAmount, setUpiAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products', search],
    queryFn: () => api.get('/products', { 
      params: { 
        search,
        limit: 50,
        isActive: true 
      } 
    }).then(res => res.data)
  })

  const createSaleMutation = useMutation({
    mutationFn: (saleData) => api.post('/sales', saleData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['sales'])
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['dashboard'])
      
      const saleId = response.data.data.id
      toast.success('Sale completed successfully!')
      
      // Reset cart
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setDiscount(0)
      setNotes('')
      setShowPayment(false)
      
      // Ask if user wants to print
      if (window.confirm('Print receipt?')) {
        window.open(`/api/print/invoice/${saleId}`, '_blank')
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to complete sale')
    }
  })

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id)
    
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        toast.error(`Only ${product.currentStock} ${product.unit} available`)
        return
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      if (product.currentStock <= 0) {
        toast.error('Out of stock')
        return
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        mrp: product.mrp,
        quantity: 1,
        unit: product.unit,
        maxStock: product.currentStock,
        image: product.image
      }])
    }
  }

  const updateQuantity = (productId, delta) => {
    const item = cart.find(i => i.productId === productId)
    const newQuantity = item.quantity + delta
    
    if (newQuantity <= 0) {
      setCart(cart.filter(i => i.productId !== productId))
    } else if (newQuantity <= item.maxStock) {
      setCart(cart.map(i => 
        i.productId === productId 
          ? { ...i, quantity: newQuantity }
          : i
      ))
    } else {
      toast.error(`Only ${item.maxStock} ${item.unit} available`)
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.productId !== productId))
  }

  const clearCart = () => {
    if (cart.length === 0) return
    if (window.confirm('Clear all items from cart?')) {
      setCart([])
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.05 // Assuming 5% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPayment(true)
  }

  const handleUPIPayment = () => {
    setUpiAmount(calculateTotal())
    setShowUPIModal(true)
  }

  const handleUPIPaymentComplete = (paid) => {
    setShowUPIModal(false)
    if (paid) {
      // Proceed with sale after UPI payment
      handlePayment()
    }
  }

  const handlePayment = () => {
    const saleData = {
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      discount,
      notes,
      subtotal: calculateSubtotal(),
      taxAmount: calculateTax(),
      totalAmount: calculateTotal()
    }

    createSaleMutation.mutate(saleData)
  }

  // Quick product search with barcode scanner simulation
  const handleBarcodeScan = (barcode) => {
    const product = products?.data?.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
      toast.success(`${product.name} added`)
    } else {
      toast.error('Product not found')
    }
  }

  if (isLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4"
    >
      {/* Products Panel */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-heading font-semibold ${theme.text.primary}`}>
            Products
          </h2>
          <span className={`text-sm ${theme.text.secondary}`}>
            {cart.length} items in cart
          </span>
        </div>

        {/* Search and Barcode */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search) {
                handleBarcodeScan(search)
                setSearch('')
              }
            }}
            className="input-field pl-10"
            autoFocus
          />
          <p className={`text-xs ${theme.text.tertiary} mt-1`}>
            Tip: Scan barcode or search product name
          </p>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-2">
          {products?.data?.map((product) => (
            <motion.button
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              disabled={product.currentStock === 0}
              className={`p-3 border rounded-lg text-left transition-all ${
                product.currentStock === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                  : 'hover:border-primary-500 hover:shadow-soft dark:hover:border-primary-400'
              }`}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">₹{product.sellingPrice}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Stock: {product.currentStock} {product.unit}
              </p>
              {product.isOrganic && (
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                  Organic
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="lg:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} flex items-center`}>
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Cart ({cart.length} items)
          </h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">₹{item.price} per {item.unit}</p>
              </div>
              
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <MinusIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <PlusIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded ml-1"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">Cart is empty</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add products to start billing
              </p>
            </div>
          )}
        </div>

        {/* Discount Input */}
        <div className="mb-3">
          <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
            Discount (₹)
          </label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            min="0"
            max={calculateSubtotal()}
            className="input-field"
            placeholder="Enter discount amount"
          />
        </div>

        {/* Notes Input */}
        <div className="mb-3">
          <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            placeholder="Any notes for this sale"
          />
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className={theme.text.secondary}>Subtotal:</span>
            <span className={`font-medium ${theme.text.primary}`}>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={theme.text.secondary}>Tax (5%):</span>
            <span className={`font-medium ${theme.text.primary}`}>₹{calculateTax().toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className={theme.text.secondary}>Discount:</span>
              <span className="font-medium text-red-600">-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className={theme.text.primary}>Total:</span>
            <span className="text-primary-600 dark:text-primary-400">₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setPaymentMethod('CASH')
              handleCheckout()
            }}
            disabled={cart.length === 0}
            className="btn-primary disabled:opacity-50 inline-flex items-center justify-center"
          >
            <BanknotesIcon className="h-4 w-4 mr-2" />
            Cash
          </button>
          <button
            onClick={() => {
              setPaymentMethod('CARD')
              handleCheckout()
            }}
            disabled={cart.length === 0}
            className="btn-primary disabled:opacity-50 inline-flex items-center justify-center"
          >
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Card
          </button>
          <button
            onClick={handleUPIPayment}
            disabled={cart.length === 0}
            className="btn-primary disabled:opacity-50 inline-flex items-center justify-center col-span-2"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            UPI QR Code
          </button>
        </div>

        {/* Quick UPI for custom amounts */}
        {cart.length === 0 && (
          <div className="mt-4">
            <QuickUPI onPaymentComplete={(amount) => {
              toast.success(`Payment of ₹${amount} recorded`)
            }} />
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          subtotal={calculateSubtotal()}
          tax={calculateTax()}
          discount={discount}
          total={calculateTotal()}
          paymentMethod={paymentMethod}
          customerName={customerName}
          customerPhone={customerPhone}
          onCustomerNameChange={setCustomerName}
          onCustomerPhoneChange={setCustomerPhone}
          onConfirm={handlePayment}
          onClose={() => setShowPayment(false)}
          loading={createSaleMutation.isLoading}
        />
      )}

      {/* UPI QR Modal */}
      <UPIPaymentModal
        isOpen={showUPIModal}
        onClose={handleUPIPaymentComplete}
        amount={upiAmount}
        orderId={`POS${Date.now()}`}
        customerName={customerName}
      />
    </motion.div>
  )
}

// Payment Modal Component
const PaymentModal = ({
  cart,
  subtotal,
  tax,
  discount,
  total,
  paymentMethod,
  customerName,
  customerPhone,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onConfirm,
  onClose,
  loading
}) => {
  const theme = useTheme()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative ${theme.bg.card} rounded-xl shadow-xl max-w-md w-full p-6 z-10`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-heading font-bold ${theme.text.primary}`}>
              Complete Payment
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Customer Details */}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Customer Phone (optional)"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h4 className={`text-sm font-medium ${theme.text.primary} mb-3`}>Order Summary</h4>
            <div className="space-y-2 text-sm">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className={theme.text.secondary}>
                    {item.name} x{item.quantity}
                  </span>
                  <span className={`font-medium ${theme.text.primary}`}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Subtotal:</span>
                  <span className={theme.text.primary}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Tax:</span>
                  <span className={theme.text.primary}>₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className={theme.text.secondary}>Discount:</span>
                    <span className="text-red-600">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className={theme.text.primary}>Total:</span>
                  <span className="text-primary-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <p className={`text-sm font-medium ${theme.text.secondary} mb-2`}>
              Payment Method: <span className="text-primary-600">{paymentMethod}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default POS
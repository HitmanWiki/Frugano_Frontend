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
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const POS = () => {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products', search],
    queryFn: () => api.get('/products', { 
      params: { 
        search,
        limit: 20,
        isActive: true 
      } 
    }).then(res => res.data)
  })

  const createSaleMutation = useMutation({
    mutationFn: (saleData) => api.post('/sales', saleData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['sales'])
      queryClient.invalidateQueries(['products'])
      toast.success('Sale completed successfully!')
      
      // Print receipt
      window.open(`/api/sales/${response.data.data.id}/print`, '_blank')
      
      // Reset cart
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setShowPayment(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to complete sale')
    }
  })

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id)
    
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        unit: product.unit,
        maxStock: product.currentStock
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

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.05 // Assuming 5% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPayment(true)
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
      discount: 0,
      notes: 'POS Sale'
    }

    createSaleMutation.mutate(saleData)
  }

  if (isLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4"
    >
      {/* Products Panel */}
      <div className="flex-1 bg-white rounded-xl shadow-card p-4 overflow-hidden flex flex-col">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Products
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products?.data?.map((product) => (
            <motion.button
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              disabled={product.currentStock === 0}
              className={`p-3 border rounded-lg text-left transition-all ${
                product.currentStock === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                  : 'hover:border-primary-500 hover:shadow-soft'
              }`}
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-sm font-semibold text-primary-600">₹{product.sellingPrice}</p>
              <p className="text-xs text-gray-500">Stock: {product.currentStock} {product.unit}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="lg:w-96 bg-white rounded-xl shadow-card p-4 flex flex-col">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
          <ShoppingCartIcon className="h-5 w-5 mr-2" />
          Cart ({cart.length} items)
        </h2>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price} per {item.unit}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MinusIcon className="h-4 w-4 text-gray-600" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <PlusIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 hover:bg-red-100 rounded ml-1"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Cart is empty</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (5%):</span>
            <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total:</span>
            <span className="text-primary-600">₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="btn-primary w-full mt-4 disabled:opacity-50"
        >
          Proceed to Payment
        </button>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowPayment(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-gray-900">
                  Complete Payment
                </h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
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
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                />
                <input
                  type="tel"
                  placeholder="Customer Phone (optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                    paymentMethod === 'CASH' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <BanknotesIcon className="h-6 w-6 mb-1" />
                  <span className="text-xs">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                    paymentMethod === 'CARD' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6 mb-1" />
                  <span className="text-xs">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                    paymentMethod === 'UPI' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <QrCodeIcon className="h-6 w-6 mb-1" />
                  <span className="text-xs">UPI</span>
                </button>
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-primary-600">₹{calculateTotal().toFixed(2)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={createSaleMutation.isLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {createSaleMutation.isLoading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default POS
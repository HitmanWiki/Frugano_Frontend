import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const PurchaseForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!!id)
  const queryClient = useQueryClient()

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/suppliers').then(res => res.data)
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then(res => res.data)
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplierId: '',
      invoiceNo: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1, purchasePrice: 0 }],
      discount: 0,
      taxAmount: 0,
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH',
      notes: '',
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const items = watch('items')
  const discount = watch('discount')
  const taxAmount = watch('taxAmount')

  useEffect(() => {
    if (id) {
      fetchPurchase()
    }
  }, [id])

  const fetchPurchase = async () => {
    try {
      const response = await api.get(`/purchases/${id}`)
      const purchase = response.data.data
      
      setValue('supplierId', purchase.supplierId)
      setValue('invoiceNo', purchase.invoiceNo)
      setValue('purchaseDate', purchase.purchaseDate.split('T')[0])
      setValue('items', purchase.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice
      })))
      setValue('discount', purchase.discount)
      setValue('taxAmount', purchase.taxAmount)
      setValue('paymentStatus', purchase.paymentStatus)
      setValue('paymentMethod', purchase.paymentMethod)
      setValue('notes', purchase.notes)
    } catch (error) {
      toast.error('Failed to fetch purchase details')
      navigate('/purchases')
    } finally {
      setFetchLoading(false)
    }
  }

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return api.put(`/purchases/${id}`, data)
      }
      return api.post('/purchases', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases'])
      toast.success(id ? 'Purchase updated successfully' : 'Purchase created successfully')
      navigate('/purchases')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Operation failed')
      setLoading(false)
    }
  })

  const calculateTotals = () => {
    let subtotal = 0
    items.forEach(item => {
      if (item.purchasePrice && item.quantity) {
        subtotal += parseFloat(item.purchasePrice) * parseFloat(item.quantity)
      }
    })
    
    const total = subtotal - parseFloat(discount || 0) + parseFloat(taxAmount || 0)
    return { subtotal, total }
  }

  const { subtotal, total } = calculateTotals()

  const onSubmit = async (data) => {
    setLoading(true)
    
    // Calculate totals
    let totalAmount = 0
    data.items.forEach(item => {
      totalAmount += parseFloat(item.purchasePrice) * parseFloat(item.quantity)
    })
    
    const netAmount = totalAmount - parseFloat(data.discount) + parseFloat(data.taxAmount)
    
    mutation.mutate({
      ...data,
      totalAmount,
      netAmount,
      items: data.items.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity),
        purchasePrice: parseFloat(item.purchasePrice)
      }))
    })
  }

  if (fetchLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/purchases')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          {id ? 'Edit Purchase' : 'New Purchase Order'}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                {...register('supplierId', { required: 'Supplier is required' })}
                className={`input-field ${errors.supplierId ? 'border-red-500' : ''}`}
              >
                <option value="">Select supplier</option>
                {suppliers?.data?.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                {...register('invoiceNo')}
                className="input-field"
                placeholder="Auto-generated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                {...register('purchaseDate')}
                className="input-field"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-gray-900">
                Items
              </h2>
              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, purchasePrice: 0 })}
                className="btn-secondary text-sm inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-5">
                    <select
                      {...register(`items.${index}.productId`, { 
                        required: 'Product is required' 
                      })}
                      className="input-field"
                    >
                      <option value="">Select product</option>
                      {products?.data?.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { 
                        required: 'Quantity required',
                        min: { value: 0.01, message: 'Invalid quantity' }
                      })}
                      className="input-field"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.purchasePrice`, { 
                        required: 'Price required',
                        min: { value: 0, message: 'Invalid price' }
                      })}
                      className="input-field"
                      placeholder="Price"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={items[index]?.purchasePrice * items[index]?.quantity || 0}
                      className="input-field bg-gray-50"
                      readOnly
                      placeholder="Total"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-lg font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('discount')}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('taxAmount')}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <span className="text-sm font-medium text-primary-700">Total:</span>
                <span className="text-xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  {...register('paymentStatus')}
                  className="input-field"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
                  className="input-field"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/purchases')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : id ? 'Update Purchase' : 'Create Purchase'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default PurchaseForm
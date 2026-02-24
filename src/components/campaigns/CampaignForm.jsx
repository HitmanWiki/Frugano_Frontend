import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useTheme } from '../../contexts/ThemeContext'

const CAMPAIGN_TYPES = [
  { value: 'FLASH_SALE', label: 'Flash Sale' },
  { value: 'SEASONAL_OFFER', label: 'Seasonal Offer' },
  { value: 'FESTIVAL_OFFER', label: 'Festival Offer' },
  { value: 'BUNDLE_OFFER', label: 'Bundle Offer' },
  { value: 'FIRST_ORDER', label: 'First Order' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'LOYALTY_REWARD', label: 'Loyalty Reward' },
  { value: 'WEEKEND_SPECIAL', label: 'Weekend Special' },
]

const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount (₹)' },
  { value: 'BUY_X_GET_Y', label: 'Buy X Get Y' },
  { value: 'FREE_SHIPPING', label: 'Free Shipping' },
]

const TARGET_TYPES = [
  { value: 'ALL_CUSTOMERS', label: 'All Customers' },
  { value: 'NEW_CUSTOMERS', label: 'New Customers' },
  { value: 'EXISTING_CUSTOMERS', label: 'Existing Customers' },
  { value: 'VIP_CUSTOMERS', label: 'VIP Customers' },
]

const CampaignForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!!id)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)))
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const queryClient = useQueryClient()

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data)
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then(res => res.data)
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const discountType = watch('discountType')

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id])

  const fetchCampaign = async () => {
    try {
      const response = await api.get(`/campaigns/${id}`)
      const campaign = response.data.data
      reset({
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        discountType: campaign.discountType,
        discountValue: campaign.discountValue,
        maxDiscount: campaign.maxDiscount,
        minOrderValue: campaign.minOrderValue,
        targetType: campaign.targetType,
        usageLimit: campaign.usageLimit,
        perUserLimit: campaign.perUserLimit,
        showOnHomepage: campaign.showOnHomepage,
        isActive: campaign.isActive,
        code: campaign.code || '',
      })
      setStartDate(new Date(campaign.startDate))
      setEndDate(new Date(campaign.endDate))
      setSelectedCategories(campaign.categories?.map(c => c.categoryId) || [])
      setSelectedProducts(campaign.products?.map(p => p.productId) || [])
    } catch (error) {
      toast.error('Failed to fetch campaign details')
      navigate('/campaigns')
    } finally {
      setFetchLoading(false)
    }
  }

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return api.put(`/campaigns/${id}`, data)
      }
      return api.post('/campaigns', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      toast.success(id ? 'Campaign updated successfully' : 'Campaign created successfully')
      navigate('/campaigns')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Operation failed')
      setLoading(false)
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const campaignData = {
      ...data,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      categoryIds: selectedCategories,
      productIds: selectedProducts,
      discountValue: parseFloat(data.discountValue),
      maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
      minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : 0,
      usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
      perUserLimit: data.perUserLimit ? parseInt(data.perUserLimit) : 1,
    }
    mutation.mutate(campaignData)
  }

  if (fetchLoading || categoriesLoading || productsLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/campaigns')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className={`h-5 w-5 ${theme.text.secondary}`} />
        </button>
        <h1 className={`text-2xl font-heading font-bold ${theme.text.primary}`}>
          {id ? 'Edit Campaign' : 'Create New Campaign'}
        </h1>
      </div>

      {/* Form */}
      <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
                Campaign Details
              </h2>
            </div>

            {/* Campaign Name */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Campaign name is required' })}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Summer Special 2024"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Campaign Type */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Campaign Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('type', { required: 'Campaign type is required' })}
                className={`input-field ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="">Select type</option>
                {CAMPAIGN_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Offer Code */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Offer Code
              </label>
              <input
                type="text"
                {...register('code')}
                className="input-field"
                placeholder="SUMMER10"
              />
              <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                Customers will use this code to avail the offer
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Description
              </label>
              <textarea
                {...register('description')}
                rows="3"
                className="input-field"
                placeholder="Campaign description..."
              />
            </div>

            {/* Date Range */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Start Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                className="input-field w-full"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                selectsStart
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                className="input-field w-full"
                dateFormat="dd/MM/yyyy"
                minDate={startDate}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            {/* Discount Settings */}
            <div className="md:col-span-2">
              <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
                Discount Settings
              </h2>
            </div>

            {/* Discount Type */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('discountType', { required: 'Discount type is required' })}
                className={`input-field ${errors.discountType ? 'border-red-500' : ''}`}
              >
                <option value="">Select discount type</option>
                {DISCOUNT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.discountType && (
                <p className="mt-1 text-sm text-red-600">{errors.discountType.message}</p>
              )}
            </div>

            {/* Discount Value */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('discountValue', { 
                  required: 'Discount value is required',
                  min: { value: 0, message: 'Value must be positive' }
                })}
                className={`input-field ${errors.discountValue ? 'border-red-500' : ''}`}
                placeholder={discountType === 'PERCENTAGE' ? '10' : '100'}
              />
              {errors.discountValue && (
                <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
              )}
            </div>

            {/* Max Discount (for percentage) */}
            {discountType === 'PERCENTAGE' && (
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                  Maximum Discount Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('maxDiscount')}
                  className="input-field"
                  placeholder="500"
                />
              </div>
            )}

            {/* Buy X Get Y fields */}
            {discountType === 'BUY_X_GET_Y' && (
              <>
                <div>
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Buy Quantity
                  </label>
                  <input
                    type="number"
                    {...register('buyQuantity')}
                    className="input-field"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Get Quantity
                  </label>
                  <input
                    type="number"
                    {...register('getQuantity')}
                    className="input-field"
                    placeholder="1"
                  />
                </div>
              </>
            )}

            {/* Minimum Order Value */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('minOrderValue')}
                className="input-field"
                placeholder="0"
              />
            </div>

            {/* Targeting */}
            <div className="md:col-span-2">
              <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
                Targeting
              </h2>
            </div>

            {/* Target Type */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Target Audience
              </label>
              <select
                {...register('targetType')}
                className="input-field"
              >
                {TARGET_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Applicable Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                {categories?.data?.map(category => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                        }
                      }}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className={`text-sm ${theme.text.primary}`}>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Specific Products
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {products?.data?.map(product => (
                    <label key={product.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={product.id}
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className={`text-sm ${theme.text.primary} truncate`}>{product.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="md:col-span-2">
              <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
                Usage Limits
              </h2>
            </div>

            {/* Total Usage Limit */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Total Usage Limit
              </label>
              <input
                type="number"
                {...register('usageLimit')}
                className="input-field"
                placeholder="Unlimited"
              />
              <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                Maximum number of times this offer can be used
              </p>
            </div>

            {/* Per User Limit */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Per User Limit
              </label>
              <input
                type="number"
                {...register('perUserLimit')}
                className="input-field"
                placeholder="1"
              />
              <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                How many times a single customer can use this offer
              </p>
            </div>

            {/* Display Options */}
            <div className="md:col-span-2">
              <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
                Display Options
              </h2>
            </div>

            {/* Show on Homepage */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('showOnHomepage')}
                id="showOnHomepage"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="showOnHomepage" className={`text-sm ${theme.text.primary}`}>
                Show on Homepage
              </label>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isActive')}
                id="isActive"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className={`text-sm ${theme.text.primary}`}>
                Active Campaign
              </label>
            </div>

            {/* WhatsApp Integration Info */}
            <div className="md:col-span-2 mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-green-600 dark:text-green-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.001 2.00195C6.486 2.00195 2.00195 6.486 2.00195 12.001C2.00195 14.3975 2.90495 16.5995 4.44595 18.262L2.09295 21.909L6.17995 20.411C7.96195 21.407 10.033 21.999 12.001 21.999C17.516 21.999 22 17.515 22 12C22 6.485 17.516 2.00195 12.001 2.00195Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    WhatsApp Campaign Ready
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    After creating this campaign, you can send it to customers via WhatsApp from the campaigns list.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : id ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default CampaignForm